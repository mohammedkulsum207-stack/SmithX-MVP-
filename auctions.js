"use strict";

/* =====================================================
   SM1THX — AUCTIONS (auctions.js)
   Phase 4 · DEMO. Rules shown to every bidder:
     • Auctions run for a maximum of 2 minutes.
     • Bids never extend an auction.
     • Minimum bid step set per auction.
     • Bids are binding and can't be withdrawn.
     • Sellers can't bid on their own auctions and can
       only cancel before the first bid.
     • Highest bid when the timer ends wins.
     • The winner has 48 hours to pay. If they don't, the
       item is offered to the next-highest bidder at that
       bidder's own price, also for 48 hours.
     • Losing bids are always free. Any winning fee is
       shown before you bid (currently KES 0).
   Saved in this browser only until SM1THX has a backend.
   Requires wallet.js (signed-in user).
===================================================== */

const SMX_AUCTIONS_KEY = "smithx_auctions_v1";

const SMX_AUCTION_RULES = {
  snipeWindowMs: 0,
  extendByMs: 0,
  payWindowMs: 48 * 60 * 60 * 1000,
  winningFeePercent: 0,
  losingBidFee: 0,
  maxDurationMs: 2 * 60 * 1000,
  durations: [
    { label: "2 minutes", ms: 2 * 60 * 1000 }
  ]
};

function smxAuctionsAll() {
  try {
    const list = JSON.parse(localStorage.getItem(SMX_AUCTIONS_KEY));
    return Array.isArray(list) ? list : [];
  } catch (error) {
    return [];
  }
}

function smxAuctionsSave(list) {
  localStorage.setItem(SMX_AUCTIONS_KEY, JSON.stringify(list));
}

function smxAuctionUpdate(id, change) {
  const list = smxAuctionsAll();
  const index = list.findIndex(item => item.id === id);
  if (index === -1) throw new Error("Auction not found.");
  const updated = change({ ...list[index], bids: (list[index].bids || []).slice() });
  list[index] = updated;
  smxAuctionsSave(list);
  return updated;
}

function smxDefaultIncrement(price) {
  const value = Number(price) || 0;
  if (value < 1000) return 50;
  if (value < 10000) return 100;
  if (value < 50000) return 500;
  return 1000;
}

function smxMaskName(name) {
  const clean = String(name || "Bidder").trim();
  if (clean.length <= 2) return clean[0] + "*";
  return clean[0] + "***" + clean[clean.length - 1];
}

function smxHighestBid(auction) {
  const bids = auction.bids || [];
  return bids.length ? bids[bids.length - 1] : null;
}

function smxMinNextBid(auction) {
  const top = smxHighestBid(auction);
  return top ? top.amount + auction.increment : auction.startPrice;
}

function smxSettleAuction(auction, now) {
  const time = now || Date.now();
  let a = auction;

  if (a.status === "live" && time >= new Date(a.endAt).getTime()) {
    const top = smxHighestBid(a);
    a = top
      ? { ...a, status: "ended", winner: { email: top.bidderEmail, name: top.bidderName, amount: top.amount, offeredAt: a.endAt, payBy: new Date(new Date(a.endAt).getTime() + SMX_AUCTION_RULES.payWindowMs).toISOString(), status: "awaiting", round: 1 }, lapsed: [] }
      : { ...a, status: "unsold" };
  }

  while (a.status === "ended" && a.winner && a.winner.status === "awaiting" && time > new Date(a.winner.payBy).getTime()) {
    const lapsed = (a.lapsed || []).concat({ ...a.winner, status: "lapsed" });
    const skip = lapsed.map(item => item.email);
    const next = (a.bids || []).slice().reverse().find(bid => !skip.includes(bid.bidderEmail));
    if (next) {
      const offeredAt = new Date(a.winner.payBy).toISOString();
      a = { ...a, lapsed, winner: { email: next.bidderEmail, name: next.bidderName, amount: next.amount, offeredAt, payBy: new Date(new Date(offeredAt).getTime() + SMX_AUCTION_RULES.payWindowMs).toISOString(), status: "awaiting", round: lapsed.length + 1 } };
    } else {
      a = { ...a, lapsed, winner: null, status: "unsold" };
    }
  }
  return a;
}

function smxAuctionsSettled() {
  const list = smxAuctionsAll();
  let changed = false;
  const settled = list.map(item => {
    const next = smxSettleAuction(item);
    if (JSON.stringify(next) !== JSON.stringify(item)) changed = true;
    return next;
  });
  if (changed) smxAuctionsSave(settled);
  return settled;
}

function smxCreateAuction(user, data) {
  if (!user) throw new Error("Sign in to create an auction.");
  const title = String(data.title || "").trim();
  const startPrice = Math.round(Number(data.startPrice));
  const increment = Math.round(Number(data.increment)) || smxDefaultIncrement(startPrice);
  const duration = SMX_AUCTION_RULES.durations.find(item => item.ms === Number(data.durationMs));

  if (title.length < 3) throw new Error("Give the item a name (at least 3 characters).");
  if (!Number.isFinite(startPrice) || startPrice < 50) throw new Error("Starting price must be at least KES 50.");
  if (increment < 10) throw new Error("Minimum bid step must be at least KES 10.");
  if (!duration) throw new Error("Choose how long the auction runs.");
  if (duration.ms > SMX_AUCTION_RULES.maxDurationMs) throw new Error("Auctions can run for a maximum of 2 minutes.");

  let storeName = "";
  try {
    const stores = JSON.parse(localStorage.getItem("smithx_stores_v1")) || [];
    const store = stores.find(item => item.ownerEmail === user.email && item.published);
    storeName = store ? store.name : "";
  } catch (error) { /* ignore */ }

  const now = Date.now();
  const auction = {
    id: "AUC-" + now.toString(36).toUpperCase(),
    sellerEmail: user.email,
    sellerName: user.name || "Seller",
    storeName,
    title,
    description: String(data.description || "").trim().slice(0, 600),
    category: data.category || "Other",
    image: String(data.image || "").trim(),
    startPrice,
    increment,
    feePercent: SMX_AUCTION_RULES.winningFeePercent,
    startAt: new Date(now).toISOString(),
    endAt: new Date(now + duration.ms).toISOString(),
    originalEndAt: new Date(now + duration.ms).toISOString(),
    extensions: 0,
    status: "live",
    bids: [],
    createdAt: new Date(now).toISOString()
  };
  const list = smxAuctionsAll();
  list.unshift(auction);
  smxAuctionsSave(list);
  return auction;
}

function smxPlaceBid(auctionId, user, amount, options) {
  const opts = options || {};
  if (!user) throw new Error("Sign in to bid.");
  const value = Math.round(Number(amount));
  let result = null;

  smxAuctionUpdate(auctionId, current => {
    const auction = smxSettleAuction(current);
    if (auction.status !== "live") throw new Error("This auction has ended.");
    if (auction.sellerEmail === user.email && !opts.simulated) throw new Error("You can't bid on your own auction.");
    const top = smxHighestBid(auction);
    if (top && top.bidderEmail === user.email && !opts.simulated) throw new Error("You're already the highest bidder.");
    const min = smxMinNextBid(auction);
    if (!Number.isFinite(value) || value < min) throw new Error("Your bid must be at least KES " + min.toLocaleString("en-KE") + ".");

    const now = Date.now();
    const bid = { id: "BID-" + now.toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5), bidderEmail: user.email, bidderName: user.name || "Bidder", amount: value, at: new Date(now).toISOString(), simulated: Boolean(opts.simulated) };
    auction.bids.push(bid);

    const extended = false;
    result = { bid, extended, auction };
    return auction;
  });
  return result;
}

function smxCancelAuction(auctionId, user) {
  return smxAuctionUpdate(auctionId, auction => {
    if (!user || auction.sellerEmail !== user.email) throw new Error("Only the seller can cancel this auction.");
    if ((auction.bids || []).length) throw new Error("Auctions can't be cancelled after the first bid.");
    if (auction.status !== "live") throw new Error("This auction has already ended.");
    return { ...auction, status: "cancelled", cancelledAt: new Date().toISOString() };
  });
}

function smxAuctionWinningFee(auction, amount) {
  return Math.round(((Number(amount) || 0) * (Number(auction.feePercent) || 0)) / 100);
}

function smxFormatCountdown(ms) {
  if (ms <= 0) return "Ended";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d) return d + "d " + h + "h " + m + "m";
  if (h) return h + "h " + m + "m " + String(sec).padStart(2, "0") + "s";
  return m + "m " + String(sec).padStart(2, "0") + "s";
}
