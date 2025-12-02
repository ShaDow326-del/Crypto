import Balances from "./sections/Balances";
import Tokens from "./sections/Tokens";
import NFTs from "./sections/NFTs";
import Transactions from "./sections/Transactions";
import Swap from "./sections/Swap";
import Staking from "./sections/Staking";

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="glass p-5 rounded-xl">
          <Balances />
        </div>

        <div className="glass p-5 rounded-xl">
          <Tokens />
        </div>

        <div className="glass p-5 rounded-xl">
          <NFTs />
        </div>

        <div className="glass p-5 rounded-xl">
          <Transactions />
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass p-5 rounded-xl">
          <Swap />
        </div>

        <div className="glass p-5 rounded-xl">
          <Staking />
        </div>
      </div>
    </div>
  );
}