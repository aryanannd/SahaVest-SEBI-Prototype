import { 
  Search, User, Download, ChevronDown, 
  Info, Activity, Globe2, PenSquare 
} from 'lucide-react';

export function TaxSummary() {
  return (
    <div className="bg-background text-on-background min-h-screen pb-[64px] md:pb-0 antialiased w-full relative">
      
      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 bg-surface border-b border-outline-variant flex items-center justify-between px-4 py-3 max-w-7xl mx-auto h-[64px]">
        <div className="flex items-center gap-1">
          <button 
            aria-label="Search" 
            className="w-[44px] h-[44px] flex items-center justify-center text-primary active:scale-95 duration-100 hover:bg-surface-container-low transition-colors rounded-full"
          >
            <Search className="w-6 h-6" />
          </button>
        </div>
        <h1 className="font-headline-md text-primary tracking-tight">SahaVest</h1>
        <div className="flex items-center gap-1">
          <button 
            aria-label="Account" 
            className="w-[44px] h-[44px] flex items-center justify-center text-primary active:scale-95 duration-100 hover:bg-surface-container-low transition-colors rounded-full"
          >
            <User className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-8">
        
        {/* Header Section */}
        <section className="flex flex-col gap-3 md:flex-row md:items-end justify-between">
          <div>
            <h2 className="font-display-lg-mobile md:font-display-lg text-on-surface">Tax Summary FY 23-24</h2>
            <p className="font-body-md text-on-surface-variant mt-1">Estimated capital gains liability across your portfolio.</p>
          </div>
          <div className="flex gap-3 mt-3 md:mt-0">
            <button className="flex-1 md:flex-none h-[48px] px-6 rounded-lg bg-surface-container border border-outline-variant font-label-md text-on-surface flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors min-w-[120px]">
              <Download className="w-5 h-5" /> Download
            </button>
            <div className="relative w-full md:w-auto">
              <select className="w-full h-[48px] pl-4 pr-10 rounded-lg bg-surface-container border border-outline-variant font-label-md text-on-surface appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <option>FY 2023-24</option>
                <option>FY 2022-23</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant w-5 h-5" />
            </div>
          </div>
        </section>

        {/* Disclaimer Banner */}
        <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4 flex items-start gap-3">
          <Info className="text-outline mt-1 w-5 h-5 flex-shrink-0" />
          <p className="font-body-md text-on-surface-variant">
            Data is for informational purposes only. Please consult a Chartered Accountant for tax filing. Realized gains denote actual booked profits/losses, while unrealized represents current market estimates.
          </p>
        </div>

        {/* High-Level Overview Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Realized Gains */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)] col-span-1 md:col-span-2 flex flex-col justify-between">
            <div>
              <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider">Total Realized Capital Gains</h3>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-display-lg-mobile md:font-display-lg text-on-surface">₹ 1,42,500</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant grid grid-cols-2 gap-3">
              <div>
                <span className="font-label-sm text-on-surface-variant block">STCG</span>
                <span className="font-body-md text-on-surface font-semibold">₹ 35,000</span>
              </div>
              <div>
                <span className="font-label-sm text-on-surface-variant block">LTCG</span>
                <span className="font-body-md text-on-surface font-semibold">₹ 1,07,500</span>
              </div>
            </div>
          </div>

          {/* Total Unrealized Gains */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)] col-span-1 md:col-span-2 flex flex-col justify-between">
            <div>
              <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider">Total Unrealized Gains</h3>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-display-lg-mobile md:font-display-lg text-on-surface">₹ 3,15,200</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant grid grid-cols-2 gap-3">
              <div>
                <span className="font-label-sm text-on-surface-variant block">Short Term Estimate</span>
                <span className="font-body-md text-on-surface font-semibold">₹ 1,10,000</span>
              </div>
              <div>
                <span className="font-label-sm text-on-surface-variant block">Long Term Estimate</span>
                <span className="font-body-md text-on-surface font-semibold">₹ 2,05,200</span>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Breakdown */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant pb-2">
            <h3 className="font-headline-sm text-on-surface">Asset Class Breakdown</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-md">Realized</button>
              <button className="px-3 py-1 rounded-full border border-outline-variant text-on-surface-variant font-label-md hover:bg-surface-container-low transition-colors">Unrealized</button>
            </div>
          </div>

          {/* Table Container (Responsive) */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="p-4 font-label-md text-on-surface-variant font-semibold whitespace-nowrap">Asset Class</th>
                    <th className="p-4 font-label-md text-on-surface-variant font-semibold text-right whitespace-nowrap">STCG (15%)</th>
                    <th className="p-4 font-label-md text-on-surface-variant font-semibold text-right whitespace-nowrap">LTCG (10%)</th>
                    <th className="p-4 font-label-md text-on-surface-variant font-semibold text-right whitespace-nowrap">Total Taxable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {/* Row 1 */}
                  <tr className="hover:bg-surface-bright transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary-fixed flex items-center justify-center text-primary">
                          <Activity className="w-5 h-5" />
                        </div>
                        <span className="font-body-md text-on-surface font-medium">Domestic Equity</span>
                      </div>
                    </td>
                    <td className="p-4 font-body-md text-on-surface text-right group-hover:text-primary transition-colors">₹ 25,000</td>
                    <td className="p-4 font-body-md text-on-surface text-right group-hover:text-primary transition-colors">₹ 85,000</td>
                    <td className="p-4 font-body-md text-on-surface font-semibold text-right">₹ 1,10,000</td>
                  </tr>
                  
                  {/* Row 2 */}
                  <tr className="hover:bg-surface-bright transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-secondary-fixed flex items-center justify-center text-secondary">
                          <Globe2 className="w-5 h-5" />
                        </div>
                        <span className="font-body-md text-on-surface font-medium">International Equity</span>
                      </div>
                    </td>
                    <td className="p-4 font-body-md text-on-surface text-right group-hover:text-primary transition-colors">₹ 10,000</td>
                    <td className="p-4 font-body-md text-on-surface text-right group-hover:text-primary transition-colors">₹ 15,000</td>
                    <td className="p-4 font-body-md text-on-surface font-semibold text-right">₹ 25,000</td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-surface-bright transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-tertiary-fixed flex items-center justify-center text-tertiary">
                          <PenSquare className="w-5 h-5" />
                        </div>
                        <span className="font-body-md text-on-surface font-medium">Gold / Debt</span>
                      </div>
                    </td>
                    <td className="p-4 font-body-md text-on-surface text-right group-hover:text-primary transition-colors">₹ 0</td>
                    <td className="p-4 font-body-md text-on-surface text-right group-hover:text-primary transition-colors">₹ 7,500</td>
                    <td className="p-4 font-body-md text-on-surface font-semibold text-right">₹ 7,500</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-surface-container border-t-2 border-outline">
                    <td className="p-4 font-body-md text-on-surface font-bold">Total</td>
                    <td className="p-4 font-body-md text-on-surface font-bold text-right">₹ 35,000</td>
                    <td className="p-4 font-body-md text-on-surface font-bold text-right">₹ 1,07,500</td>
                    <td className="p-4 font-body-md text-primary font-bold text-right text-lg">₹ 1,42,500</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
