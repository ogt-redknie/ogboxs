"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  Send,
  Download,
  ArrowLeftRight,
  Plus,
  ChevronRight,
  ExternalLink,
  X,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Repeat,
  ImageIcon,
  RefreshCw,
  Settings,
  Lock,
  Key,
} from "lucide-react";
import { useStore, type Transaction, type NFT } from "@/lib/store";
import { t } from "@/lib/i18n";
import { copyToClipboard } from "@/lib/utils";
import toast from "react-hot-toast";
import CoinIcon from "@/components/CoinIcon";
import { QRCodeSVG } from "qrcode.react";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { decryptWallet, storeSessionKey, getStoredWallets } from "@/lib/walletCrypto";

// Dynamic import to avoid pulling LoginApp into the initial bundle
// ssr: false because LoginApp uses window, localStorage, etc.
const LoginApp = dynamic(
  () => import("@/components/login/LoginApp"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--ogbo-blue)] border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

function formatTimeAgo(ts: number, locale: "zh" | "en") {
  const diff = Date.now() - ts;
  if (diff < 60000) return locale === "zh" ? "刚刚" : "Just now";
  if (diff < 3600000) return locale === "zh" ? `${Math.floor(diff / 60000)}分钟前` : `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return locale === "zh" ? `${Math.floor(diff / 3600000)}小时前` : `${Math.floor(diff / 3600000)}h ago`;
  return locale === "zh" ? `${Math.floor(diff / 86400000)}天前` : `${Math.floor(diff / 86400000)}d ago`;
}

function TxIcon({ type }: { type: "send" | "receive" | "swap" }) {
  if (type === "send") return <ArrowUpRight className="w-4 h-4 text-[var(--ogbo-red)]" />;
  if (type === "receive") return <ArrowDownLeft className="w-4 h-4 text-[var(--ogbo-green)]" />;
  return <Repeat className="w-4 h-4 text-[var(--ogbo-blue)]" />;
}

function TxDetailModal({ open, onClose, tx, locale }: { open: boolean; onClose: () => void; tx: Transaction | null; locale: "zh" | "en" }) {
  if (!open || !tx) return null;
  const typeLabel = tx.type === "send" ? (locale === "zh" ? "发送" : "Send") : tx.type === "receive" ? (locale === "zh" ? "接收" : "Receive") : (locale === "zh" ? "兑换" : "Swap");
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-sm rounded-2xl bg-card p-5 text-card-foreground"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">{t("assets.txDetail", locale)}</h3>
              <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="text-center mb-5">
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                tx.status === "completed" ? "bg-emerald-100 dark:bg-emerald-950/50" : "bg-amber-100 dark:bg-amber-950/50"
              }`}>
                <Check className={`w-6 h-6 ${tx.status === "completed" ? "text-[var(--ogbo-green)]" : "text-[var(--ogbo-orange)]"}`} />
              </div>
              <p className="text-sm font-medium text-[var(--ogbo-green)]">
                {tx.status === "completed" ? t("assets.completed", locale) : t("assets.pending", locale)}
              </p>
            </div>
            <div className="text-center mb-5">
              <p className="text-xs text-muted-foreground">{typeLabel}</p>
              <p className={`text-2xl font-bold ${tx.amount < 0 ? "text-[var(--ogbo-red)]" : "text-[var(--ogbo-green)]"}`}>
                {tx.amount > 0 ? "+" : ""}{tx.amount} {tx.symbol}
              </p>
            </div>
            <div className="space-y-3 text-sm">
              {tx.to && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("assets.to", locale)}</span>
                  <span className="font-mono text-xs">{tx.to}</span>
                </div>
              )}
              {tx.from && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("assets.from", locale)}</span>
                  <span className="font-mono text-xs">{tx.from}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">{locale === "zh" ? "时间" : "Time"}</span>
                <span className="text-xs">{new Date(tx.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("assets.network", locale)}</span>
                <span className="text-xs">Ethereum</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("assets.gas", locale)}</span>
                <span className="text-xs">0.0012 ETH</span>
              </div>
            </div>
            <button
              onClick={() => toast(locale === "zh" ? "即将打开区块浏览器" : "Opening block explorer")}
              className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-muted py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              {t("assets.explorer", locale)}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NFTDetailModal({ open, onClose, nft, locale }: { open: boolean; onClose: () => void; nft: NFT | null; locale: "zh" | "en" }) {
  if (!open || !nft) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-sm rounded-2xl bg-card p-5 text-card-foreground"
          >
            <button onClick={onClose} className="absolute top-4 right-4 rounded-full p-1 hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
            <div className="w-full aspect-square rounded-xl mb-4 flex items-center justify-center text-6xl" style={{ backgroundColor: nft.color + "20" }}>
              <span style={{ color: nft.color }}>NFT</span>
            </div>
            <h3 className="text-lg font-bold">{nft.name}</h3>
            <p className="text-sm text-muted-foreground">{nft.collection}</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">{locale === "zh" ? "属性" : "Traits"}</span>
                <span>3</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">{t("assets.floorPrice", locale)}</span>
                <span className="font-semibold">{nft.floorPrice} ETH</span>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => toast(locale === "zh" ? "即将跳转到OpenSea" : "Opening on OpenSea")}
                className="flex-1 rounded-xl bg-[var(--ogbo-blue)] py-2.5 text-sm font-medium text-white flex items-center justify-center gap-2 hover:bg-[var(--ogbo-blue-hover)] transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> OpenSea
              </button>
              <button onClick={() => toast(t("common.comingSoon", locale))} className="rounded-xl px-4 py-2.5 bg-muted text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ReceiveModal({ open, onClose, address, locale }: { open: boolean; onClose: () => void; address: string; locale: "zh" | "en" }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-sm rounded-2xl bg-card p-6 text-card-foreground shadow-2xl text-center"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">{locale === "zh" ? "接收代币" : "Receive"}</h3>
            <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-sm border border-border">
            <QRCodeSVG value={address} size={200} />
          </div>
          
          <p className="text-xs text-muted-foreground mb-2">{locale === "zh" ? "扫描二维码或复制下方地址" : "Scan QR or copy address below"}</p>
          <div className="bg-muted p-3 rounded-xl break-all font-mono text-xs mb-6 select-all">
            {address}
          </div>
          
          <button
            onClick={() => { copyToClipboard(address); toast.success(t("assets.addressCopied", locale)); }}
            className="w-full bg-[var(--ogbo-blue)] text-white rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" /> {locale === "zh" ? "复制地址" : "Copy Address"}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function SendModal({ 
  open, onClose, locale, onSend, isExternal, wallet 
}: { 
  open: boolean; onClose: () => void; locale: "zh" | "en"; 
  onSend: (to: string, amount: string) => Promise<string>;
  isExternal: boolean;
  wallet: any;
}) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { sendTransaction: sendWagmi } = useSendTransaction();

  if (!open) return null;

  const handleSend = async () => {
    setLoading(true);
    try {
      if (isExternal) {
        sendWagmi({ to: to as `0x${string}`, value: parseEther(amount) });
        toast.success(locale === "zh" ? "请在您的钱包 App 中确认交易" : "Please confirm in your wallet app");
        onClose();
      } else {
        const hash = await onSend(to, amount);
        toast.success(locale === "zh" ? "交易已发送" : "Transaction sent");
        onClose();
      }
    } catch (e: any) {
      if (e.message === 'SESSION_LOCKED') {
        toast.error(locale === "zh" ? "请先解锁钱包" : "Please unlock wallet first");
      } else {
        toast.error(locale === "zh" ? "发送失败" : "Send failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-sm rounded-2xl bg-card p-6 text-card-foreground shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">{locale === "zh" ? "发送代币" : "Send"}</h3>
            <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">{locale === "zh" ? "接收地址" : "Recipient Address"}</label>
              <input
                value={to || ""}
                onChange={(e) => setTo(e.target.value)}
                placeholder="0x..."
                className="w-full bg-muted border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--ogbo-blue)]"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">{locale === "zh" ? "数量" : "Amount"}</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount || ""}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-muted border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--ogbo-blue)]"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  {wallet?.tokens[0]?.symbol || "ETH"}
                </span>
              </div>
              <div className="flex justify-between mt-1 px-1">
                <span className="text-[10px] text-muted-foreground">
                  {locale === "zh" ? "可用余额" : "Balance"}: {wallet?.tokens[0]?.amount || 0}
                </span>
                <button onClick={() => setAmount(wallet?.tokens[0]?.amount?.toString() || "0")} className="text-[10px] text-[var(--ogbo-blue)] font-bold">
                  {locale === "zh" ? "全部" : "MAX"}
                </button>
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={!to || !amount || loading}
              className="w-full bg-[var(--ogbo-blue)] text-white rounded-xl py-4 text-sm font-bold hover:bg-[var(--ogbo-blue-hover)] transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? (locale === "zh" ? "处理中..." : "Processing...") : (locale === "zh" ? "发送" : "Send")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function PasswordConfirmModal({ open, onClose, locale, onConfirm }: { open: boolean; onClose: () => void; locale: "zh" | "en"; onConfirm: (pass: string) => Promise<void> }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(password);
      onClose();
    } catch (e) {
      toast.error(locale === "zh" ? "密码错误" : "Incorrect password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[70] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-sm rounded-2xl bg-card p-6 text-card-foreground shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">{locale === "zh" ? "解锁钱包" : "Unlock Wallet"}</h3>
            <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl flex gap-3">
              <Lock className="w-5 h-5 text-[var(--ogbo-blue)] shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-400">
                {locale === "zh" ? "执行关键操作需要验证您的钱包密码。" : "Verification of your wallet password is required for critical operations."}
              </p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">{locale === "zh" ? "请输入钱包密码" : "Enter Wallet Password"}</label>
              <input
                type="password"
                value={password || ""}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                className="w-full bg-muted border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--ogbo-blue)]"
              />
            </div>
            <button
              onClick={handleConfirm}
              disabled={!password || loading}
              className="w-full bg-[var(--ogbo-blue)] text-white rounded-xl py-3 text-sm font-bold hover:bg-[var(--ogbo-blue-hover)] transition-colors disabled:opacity-50"
            >
              {loading ? (locale === "zh" ? "验证中..." : "Verifying...") : (locale === "zh" ? "确认" : "Confirm")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ExportModal({ open, onClose, walletId, locale, onExport }: { open: boolean; onClose: () => void; walletId: string; locale: "zh" | "en"; onExport: (id: string, pass: string) => Promise<string> }) {
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleExport = async () => {
    setLoading(true);
    try {
      const pk = await onExport(walletId, password);
      setResult(pk);
    } catch (e) {
      toast.error(locale === "zh" ? "密码错误或导出失败" : "Incorrect password or export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-sm rounded-2xl bg-card p-5 text-card-foreground shadow-2xl"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold">{locale === "zh" ? "导出私钥" : "Export Private Key"}</h3>
            <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
          </div>
          
          {!result ? (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl flex gap-3">
                <Lock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  {locale === "zh" ? "私钥一旦泄露，资产将无法找回。请确保周围环境安全。" : "If the private key is leaked, assets cannot be recovered. Ensure your surroundings are safe."}
                </p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">{locale === "zh" ? "请输入钱包密码" : "Enter Wallet Password"}</label>
                <input
                type="password"
                value={password || ""}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                className="w-full bg-muted border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--ogbo-blue)] transition-all"
              />
              </div>
              <button
                onClick={handleExport}
                disabled={!password || loading}
                className="w-full bg-[var(--ogbo-blue)] text-white rounded-xl py-3 text-sm font-bold hover:bg-[var(--ogbo-blue-hover)] transition-colors disabled:opacity-50"
              >
                {loading ? (locale === "zh" ? "解密中..." : "Decrypting...") : (locale === "zh" ? "确认导出" : "Confirm Export")}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-xl break-all font-mono text-xs select-all">
                {result}
              </div>
              <button
                onClick={() => { copyToClipboard(result); toast.success(t("assets.addressCopied", locale)); }}
                className="w-full bg-[var(--ogbo-blue)] text-white rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" /> {locale === "zh" ? "复制私钥" : "Copy Private Key"}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function AssetsPage() {
  const { locale, isBalanceVisible, toggleBalance, wallets, currentWalletId, switchWallet, switchTab, syncWalletAssets, exportPrivateKey, sendTransaction } = useStore();
  const wallet = useStore((s) => s.getCurrentWallet());
  const [copied, setCopied] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [walletFlowModal, setWalletFlowModal] = useState<'import' | 'create' | null>(null);
  const [exportingWalletId, setExportingWalletId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [passwordConfirmOpen, setPasswordConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'send' | 'export' | null>(null);

  const isExternal = wallet?.type === 'external';

  // 初始加载同步一次
  useEffect(() => {
    if (wallet) syncWalletAssets();
  }, []);

  // 监听当前钱包 ID 变化，自动触发同步
  useEffect(() => {
    if (currentWalletId) {
      console.log(`[AssetsPage] Wallet changed to ${currentWalletId}, triggering sync...`);
      syncWalletAssets();
    }
  }, [currentWalletId, syncWalletAssets]);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncWalletAssets();
    setIsSyncing(false);
    toast.success(locale === "zh" ? "同步完成" : "Sync completed");
  };

  const handleAction = (type: 'send' | 'receive') => {
    if (type === 'receive') {
      setReceiveModalOpen(true);
      return;
    }

    const storedWallets = getStoredWallets();
    const stored = storedWallets.find(w => w.id === wallet?.id);
    
    if (stored?.type === 'external') {
      setSendModalOpen(true);
    } else {
      // Internal wallet: check session
      if (!sessionStorage.getItem("ogbo_session_pk")) {
        setPendingAction('send');
        setPasswordConfirmOpen(true);
      } else {
        setSendModalOpen(true);
      }
    }
  };

  const onPasswordVerified = async (pass: string) => {
    const storedWallets = getStoredWallets();
    const stored = storedWallets.find(w => w.id === wallet?.id);
    if (!stored) return;

    try {
      const decrypted = await decryptWallet(stored.keystore, pass);
      storeSessionKey(decrypted.privateKey);
      
      if (pendingAction === 'send') {
        setSendModalOpen(true);
      }
      setPendingAction(null);
    } catch (e) {
      throw e;
    }
  };

  // 钱包未加载时（新用户/初始化中）显示空态，防止 wallet.address 崩溃
  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center h-full pb-20 text-muted-foreground">
        <Wallet className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-sm font-medium">{locale === 'zh' ? '暂无钱包数据' : 'No wallet data'}</p>
        <p className="text-xs mt-1 opacity-60">{locale === 'zh' ? '请先导入或创建钱包' : 'Please import or create a wallet'}</p>
      </div>
    );
  }

  const shortAddr = wallet.address.slice(0, 6) + "..." + wallet.address.slice(-4);

  const handleCopy = async () => {
    try {
      await copyToClipboard(wallet.address);
      setCopied(true);
      toast.success(t("assets.addressCopied", locale));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(locale === "zh" ? "复制失败，请手动复制" : "Copy failed, please copy manually");
    }
  };

  return (
    <div className="pb-4 lg:pb-8 overflow-y-auto lg:max-w-5xl lg:mx-auto lg:w-full">
      {/* Wallet Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 lg:mx-6 rounded-2xl gradient-primary p-5 lg:p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_30%,white_0%,transparent_50%)]" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-white/90 text-sm font-medium">{wallet.name}</span>
              <button onClick={() => setWalletMenuOpen(true)} className="text-white/60 text-xs">{"▼"}</button>
            </div>
            <div className="flex gap-1.5">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSync}
                disabled={isSyncing}
                className="rounded-full p-1.5 bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-white ${isSyncing ? "animate-spin" : ""}`} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleCopy}
                className="rounded-full p-1.5 bg-white/10 hover:bg-white/20 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4 text-white" />}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleBalance}
                className="rounded-full p-1.5 bg-white/10 hover:bg-white/20 transition-colors"
              >
                {isBalanceVisible ? <Eye className="w-4 h-4 text-white" /> : <EyeOff className="w-4 h-4 text-white" />}
              </motion.button>
            </div>
          </div>
          <p className="text-white/50 text-xs font-mono mb-3">{shortAddr}</p>

          <p className="text-white/70 text-xs mb-1">{t("home.totalAssets", locale)}</p>
          <AnimatePresence mode="wait">
            <motion.div key={isBalanceVisible ? "show" : "hide"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-3xl lg:text-4xl font-bold text-white">
                {isBalanceVisible ? `¥ ${wallet.balance.cny.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "¥ ******"}
              </p>
              <p className="text-sm text-white/60 mt-0.5">
                {isBalanceVisible ? `≈ $${wallet.balance.usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "≈ $****"}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-2 mt-4">
            {[
              { icon: Send, label: t("home.send", locale), type: 'send' as const },
              { icon: Download, label: t("home.receive", locale), type: 'receive' as const },
              { icon: ArrowLeftRight, label: t("home.swap", locale), type: 'swap' as const },
            ].map((action) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (action.type === 'swap') {
                    toast(t("common.comingSoon", locale));
                  } else {
                    handleAction(action.type);
                  }
                }}
                className="flex-1 flex flex-col items-center gap-1.5 rounded-xl bg-white/15 backdrop-blur-md py-2 hover:bg-white/25 transition-colors"
              >
                <action.icon className="w-4 h-4 text-white" />
                <span className="text-[10px] text-white font-medium">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Wallet Selector Menu */}
      <AnimatePresence>
        {walletMenuOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setWalletMenuOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-xs rounded-2xl bg-card p-4 text-card-foreground"
            >
              <h4 className="text-sm font-semibold mb-3">{t("assets.myWallets", locale)}</h4>
              <div className="space-y-2 mb-3">
                {wallets.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => { switchWallet(w.id); setWalletMenuOpen(false); toast.success(`${t("common.switchedTo", locale)} ${w.name}`); }}
                    className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition-colors ${w.id === currentWalletId ? "bg-[var(--ogbo-blue)]/10 border border-[var(--ogbo-blue)]/30" : "hover:bg-muted"}`}
                  >
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium">{w.name}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono">{w.address.slice(0, 8)}...{w.address.slice(-4)}</p>
                    </div>
                    {w.id === currentWalletId && <Check className="w-4 h-4 text-[var(--ogbo-blue)]" />}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setWalletMenuOpen(false); setWalletFlowModal('import'); }} className="flex-1 rounded-xl border border-dashed border-border py-2 text-xs text-muted-foreground hover:bg-muted transition-colors">
                  + {t("assets.importWallet", locale)}
                </button>
                <button onClick={() => { setWalletMenuOpen(false); setWalletFlowModal('create'); }} className="flex-1 rounded-xl border border-dashed border-border py-2 text-xs text-muted-foreground hover:bg-muted transition-colors">
                  + {t("assets.createWallet", locale)}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Token List */}
      <div className="mt-5 lg:mt-6 mx-4 lg:mx-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">{t("assets.myAssets", locale)}</h3>
          <button onClick={() => toast(t("common.comingSoon", locale))} className="rounded-full p-1 hover:bg-muted transition-colors">
            <Plus className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="space-y-2">
          {wallet.tokens.length === 0 ? (
            <div className="flex flex-col items-center py-10 rounded-2xl bg-card border border-border/50 opacity-60">
              <RefreshCw className="w-8 h-8 mb-2 animate-pulse text-muted-foreground/30" />
              <p className="text-xs">{locale === 'zh' ? '正在扫描链上资产...' : 'Scanning on-chain assets...'}</p>
            </div>
          ) : (
            wallet.tokens.map((token, i) => (
              <motion.button
                key={`${token.symbol}-${token.name}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                whileTap={{ scale: 0.99 }}
                onClick={() => switchTab("market")}
                className="w-full flex items-center gap-3 lg:gap-4 rounded-xl bg-card p-3 lg:p-4 shadow-card border border-border/50 text-left group"
              >
                <CoinIcon symbol={token.symbol} icon={token.icon} className="w-10 h-10 lg:w-12 lg:h-12 text-sm lg:text-base" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{token.symbol}</span>
                    <span className="text-sm font-semibold">
                      {isBalanceVisible ? `${token.amount} ${token.symbol}` : "****"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{token.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {isBalanceVisible ? `¥${token.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "¥****"}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* NFT Collection */}
      <div className="mt-6 lg:mt-8 mx-4 lg:mx-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm lg:text-base font-semibold">{t("assets.nftCollection", locale)}</h3>
          <button onClick={() => switchTab("discover")} className="text-xs text-muted-foreground hover:text-[var(--ogbo-blue)] flex items-center transition-colors">
            {t("home.viewAll", locale)}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {wallet.nfts.length === 0 ? (
          <div className="flex flex-col items-center py-8 rounded-2xl bg-card border border-border/50">
            <ImageIcon className="w-10 h-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">{t("assets.noNFT", locale)}</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">{t("assets.noNFTDesc", locale)}</p>
            <button onClick={() => switchTab("discover")} className="mt-3 rounded-lg bg-[var(--ogbo-blue)] px-4 py-1.5 text-xs text-white font-medium hover:bg-[var(--ogbo-blue-hover)] transition-colors">
              {t("assets.goDiscover", locale)}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 lg:gap-3">
            {wallet.nfts.map((nft, i) => (
              <motion.button
                key={nft.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedNFT(nft)}
                className="rounded-xl overflow-hidden bg-card border border-border/50 shadow-card"
              >
                <div className="aspect-square flex items-center justify-center text-3xl" style={{ backgroundColor: nft.color + "15" }}>
                  <span style={{ color: nft.color }} className="font-bold text-sm">NFT</span>
                </div>
                <div className="p-2">
                  <p className="text-[10px] font-medium truncate">{nft.name}</p>
                  <p className="text-[9px] text-muted-foreground">{nft.collection}</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="mt-6 lg:mt-8 mx-4 lg:mx-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm lg:text-base font-semibold">{t("assets.recentTx", locale)}</h3>
          <button className="text-xs text-muted-foreground hover:text-[var(--ogbo-blue)] flex items-center transition-colors">
            {t("home.viewAll", locale)}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="space-y-2">
          {wallet.transactions.map((tx, i) => {
            const typeLabel = tx.type === "send" ? (locale === "zh" ? "发送" : "Send") : tx.type === "receive" ? (locale === "zh" ? "接收" : "Receive") : (locale === "zh" ? "兑换" : "Swap");
            return (
              <motion.button
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedTx(tx)}
                className="w-full flex items-center gap-3 rounded-xl bg-card p-3 shadow-card border border-border/50 text-left group"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  tx.type === "send" ? "bg-red-50 dark:bg-red-950/30" : tx.type === "receive" ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-blue-50 dark:bg-blue-950/30"
                }`}>
                  <TxIcon type={tx.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{typeLabel}</span>
                    <span className={`text-sm font-semibold ${tx.amount < 0 ? "text-[var(--ogbo-red)]" : "text-[var(--ogbo-green)]"}`}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount} {tx.symbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground truncate pr-2">
                      {tx.to ? `${locale === "zh" ? "至" : "To"} ${tx.to}` : tx.from ? `${locale === "zh" ? "来自" : "From"} ${tx.from}` : ""}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {formatTimeAgo(tx.timestamp, locale)}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Wallet Management */}
      <div className="mt-6 lg:mt-8 mx-4 lg:mx-6 mb-4">
        <h3 className="text-sm lg:text-base font-semibold mb-3">{t("assets.myWallets", locale)}</h3>
        <div className="space-y-2">
          {wallets.map((w) => (
            <motion.div
              key={w.id}
              whileTap={{ scale: 0.99 }}
              onClick={() => { switchWallet(w.id); toast.success(`${t("common.switchedTo", locale)} ${w.name}`); }}
              className={`w-full flex items-center gap-3 rounded-xl p-3 border text-left transition-all cursor-pointer ${
                w.id === currentWalletId ? "bg-[var(--ogbo-blue)]/5 border-[var(--ogbo-blue)]/20" : "bg-card border-border/50 shadow-card hover:shadow-card-hover"
              }`}
              role="button"
              tabIndex={0}
            >
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{w.name}</span>
                  {w.id === currentWalletId && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--ogbo-blue)] text-white font-medium">{t("assets.current", locale)}</span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground font-mono">{w.address.slice(0, 10)}...{w.address.slice(-6)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-muted-foreground">
                  {isBalanceVisible ? `¥${w.balance.cny.toLocaleString()}` : "¥****"}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setExportingWalletId(w.id); }}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  title={locale === "zh" ? "管理" : "Manage"}
                >
                  <Key className="w-4 h-4 text-muted-foreground/60" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex gap-3 mt-3">
          <button onClick={() => setWalletFlowModal('import')} className="flex-1 rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> {t("assets.importWallet", locale)}
          </button>
          <button onClick={() => setWalletFlowModal('create')} className="flex-1 rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> {t("assets.createWallet", locale)}
          </button>
        </div>
      </div>

      <TxDetailModal open={!!selectedTx} onClose={() => setSelectedTx(null)} tx={selectedTx} locale={locale} />
      <NFTDetailModal open={!!selectedNFT} onClose={() => setSelectedNFT(null)} nft={selectedNFT} locale={locale} />
      <ExportModal 
        open={!!exportingWalletId} 
        onClose={() => setExportingWalletId(null)} 
        walletId={exportingWalletId || ""} 
        locale={locale} 
        onExport={exportPrivateKey}
      />

      <ReceiveModal
        open={receiveModalOpen}
        onClose={() => setReceiveModalOpen(false)}
        address={wallet.address}
        locale={locale}
      />

      <SendModal
        open={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        locale={locale}
        onSend={sendTransaction}
        isExternal={wallet.type === 'external'}
        wallet={wallet}
      />

      <PasswordConfirmModal
        open={passwordConfirmOpen}
        onClose={() => { setPasswordConfirmOpen(false); setPendingAction(null); }}
        locale={locale}
        onConfirm={onPasswordVerified}
      />

      {/* 全屏 Modal：导入/创建钱包流程 */}
      <AnimatePresence>
        {walletFlowModal && (
          <motion.div
            className="fixed inset-0 z-[100] bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <LoginApp
              initialView={walletFlowModal === 'import' ? 'import-select' : 'create-network'}
              isModal={true}
              onModalSuccess={() => {
                setWalletFlowModal(null);
                toast.success(locale === 'zh' ? '钱包添加成功' : 'Wallet added successfully');
              }}
              onModalClose={() => setWalletFlowModal(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
