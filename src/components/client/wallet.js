import React, { useEffect, useState } from "react";
import Link from "next/link";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import { fetchById } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import { CLIENT_BOOKINGS_EVENT } from "../../store/clientNotifStore";

/* CYT Wallet (2026-11-20): the client's prepaid session money — session packs bought with a booking, minus each
   completed session (worked out on the server, GET /my-wallet). One shared fetch for the top-bar chip, the
   My Space strip and the wallet page; refetched when a session changes (CLIENT_BOOKINGS_EVENT). */

let cache = { at: 0, data: null, p: null };
const load = (force) => {
  if (!force && cache.data && Date.now() - cache.at < 60000) return Promise.resolve(cache.data);
  if (!cache.p || force) {
    cache.p = fetchById(`${apiUrl}/my-wallet`)
      .then((r) => { cache = { at: Date.now(), data: r?.status ? r.data : null, p: null }; return cache.data; })
      .catch(() => { cache.p = null; return cache.data; });
  }
  return cache.p;
};

export function useWallet() {
  const [w, setW] = useState(cache.data);
  useEffect(() => {
    let alive = true;
    const get = (force) => load(force).then((d) => { if (alive) setW(d); });
    get(false);
    const on = () => get(true);
    window.addEventListener(CLIENT_BOOKINGS_EVENT, on);
    return () => { alive = false; window.removeEventListener(CLIENT_BOOKINGS_EVENT, on); };
  }, []);
  return w;
}

export const inr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;
export const hasWallet = (w) => !!w && ((w.packs || []).length > 0 || (w.clinic || []).length > 0);

// top bar: always there once loaded (₹0 when empty) — opens the wallet
export function WalletChip() {
  const w = useWallet();
  if (!w) return null;
  return (
    <Link href="/client/wallet" className="cls-wallet" aria-label={`Wallet balance ${inr(w.balance)}`} title="My wallet">
      <AccountBalanceWalletRoundedIcon /><b>{inr(w.balance)}</b>
    </Link>
  );
}

// My Space: a slim wallet line when there's a pack or clinic package
export function WalletStrip() {
  const w = useWallet();
  if (!hasWallet(w)) return null;
  const left = (w.packs || []).filter((p) => !p.expired).reduce((n, p) => n + Math.max(0, p.size - p.completed), 0)
    + (w.clinic || []).reduce((n, c) => n + c.left, 0);
  return (
    <Link href="/client/wallet" className="wl-strip">
      <style>{WL_STRIP_CSS}</style>
      <span className="wl-strip-ic" aria-hidden="true"><AccountBalanceWalletRoundedIcon /></span>
      <span className="wl-strip-t"><small>CYT Wallet</small><b>{inr(w.balance)}</b></span>
      <span className="wl-strip-s">{left} session{left === 1 ? "" : "s"} left{w.reserved > 0 ? ` · ${inr(w.reserved)} booked` : ""}</span>
      <i aria-hidden="true">›</i>
    </Link>
  );
}

const WL_STRIP_CSS = `
.wl-strip { display: flex; align-items: center; gap: 12px; padding: 14px 16px; margin: 0 0 14px; border-radius: 20px; text-decoration: none !important; color: #fff !important;
  background: linear-gradient(135deg, #1e7a4c 0%, #14532d 60%, #0f3f24 100%); box-shadow: 0 16px 30px -22px rgba(11,52,30,.9); }
.wl-strip-ic { flex: none; width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; background: rgba(255,255,255,.14); color: #ecc77d; }
.wl-strip-t { display: flex; flex-direction: column; line-height: 1.15; }
.wl-strip-t small { font-size: 11.5px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,.75); }
.wl-strip-t b { font-size: 22px; font-weight: 800; letter-spacing: -.02em; }
.wl-strip-s { margin-left: auto; font-size: 13px; color: rgba(255,255,255,.85); text-align: right; }
.wl-strip > i { font-style: normal; font-size: 22px; color: #ecc77d; }
`;
