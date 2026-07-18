import React, { useState, useMemo } from 'react';

// Enhanced representative dataset based on Toronto Profiles & Geospatial indicators
const INITIAL_NEIGHBOURHOOD_DATA = [
  { id: 1, name: "Mount Olive-Silverstone-Jamestown", region: "Etobicoke", income: 45000, spacesPer100: 8, singleParentPct: 48, totalChildren: 3200, capacity: 256, transitAccess: "Low" },
  { id: 2, name: "Black Creek", region: "North York", income: 42000, spacesPer100: 9, singleParentPct: 45, totalChildren: 2800, capacity: 252, transitAccess: "Low" },
  { id: 3, name: "West Humber-Clairville", region: "Etobicoke", income: 52000, spacesPer100: 12, singleParentPct: 40, totalChildren: 2900, capacity: 348, transitAccess: "Medium" },
  { id: 4, name: "Regent Park", region: "Downtown", income: 38000, spacesPer100: 22, singleParentPct: 42, totalChildren: 1800, capacity: 396, transitAccess: "High" },
  { id: 5, name: "Thorncliffe Park", region: "East York", income: 48000, spacesPer100: 18, singleParentPct: 35, totalChildren: 3500, capacity: 630, transitAccess: "Medium" },
  { id: 6, name: "Glenfield-Jane Heights", region: "North York", income: 49000, spacesPer100: 14, singleParentPct: 38, totalChildren: 2600, capacity: 364, transitAccess: "Low" },
  { id: 7, name: "York University Heights", region: "North York", income: 54000, spacesPer100: 16, singleParentPct: 32, totalChildren: 3100, capacity: 496, transitAccess: "High" },
  { id: 8, name: "Don Valley Village", region: "North York", income: 70000, spacesPer100: 24, singleParentPct: 28, totalChildren: 2200, capacity: 528, transitAccess: "Medium" },
  { id: 9, name: "Willowdale West", region: "North York", income: 85000, spacesPer100: 28, singleParentPct: 22, totalChildren: 1900, capacity: 532, transitAccess: "High" },
  { id: 10, name: "The Beaches", region: "East End", income: 130000, spacesPer100: 42, singleParentPct: 18, totalChildren: 2100, capacity: 882, transitAccess: "High" },
  { id: 11, name: "South Eglinton-Davisville", region: "Midtown", income: 125000, spacesPer100: 45, singleParentPct: 15, totalChildren: 2400, capacity: 1080, transitAccess: "High" },
  { id: 12, name: "Kingsway South", region: "Etobicoke", income: 150000, spacesPer100: 38, singleParentPct: 12, totalChildren: 1500, capacity: 570, transitAccess: "Medium" },
  { id: 13, name: "Bridle Path-Sunnybrook", region: "North York", income: 180000, spacesPer100: 48, singleParentPct: 10, totalChildren: 1200, capacity: 576, transitAccess: "Medium" },
  { id: 14, name: "Playter Estates-Danforth", region: "East End", income: 115000, spacesPer100: 35, singleParentPct: 16, totalChildren: 1400, capacity: 490, transitAccess: "High" },
];

// City averages for GBA+ benchmarking
const CITY_AVERAGES = {
  income: 76000,
  spacesPer100: 21,
  singleParentPct: 25,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('scatter'); // 'scatter', 'simulator', 'table'
  const [selectedId, setSelectedId] = useState(1); // Default to first neighbourhood
  const [hoveredId, setHoveredId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  
  // Simulation State: tracking added spaces per neighbourhood
  const [simulatedSpaces, setSimulatedSpaces] = useState({});

  // Reset Simulation
  const handleResetSimulation = () => {
    setSimulatedSpaces({});
  };

  // Add 50 spaces to a specific neighbourhood in simulation
  const handleSimulateSpaces = (id) => {
    setSimulatedSpaces(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 50
    }));
  };

  // Dynamic calculations incorporating simulated additions
  const processedData = useMemo(() => {
    return INITIAL_NEIGHBOURHOOD_DATA.map(n => {
      const added = simulatedSpaces[n.id] || 0;
      const totalCapacity = n.capacity + added;
      const spacesPer100 = Math.round((totalCapacity / n.totalChildren) * 100);
      return {
        ...n,
        capacity: totalCapacity,
        spacesPer100: spacesPer100,
        isModified: added > 0
      };
    });
  }, [simulatedSpaces]);

  // Filters
  const regions = ['All', ...new Set(INITIAL_NEIGHBOURHOOD_DATA.map(n => n.region))];

  const filteredData = useMemo(() => {
    return processedData.filter(n => {
      const matchesSearch = n.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = selectedRegion === 'All' || n.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [processedData, searchQuery, selectedRegion]);

  const activeNeighbourhood = useMemo(() => {
    return processedData.find(n => n.id === (hoveredId || selectedId)) || processedData[0];
  }, [processedData, selectedId, hoveredId]);

  // Chart Dimensions & Scales
  const width = 740;
  const height = 400;
  const padding = 60;
  
  const minIncome = 20000;
  const maxIncome = 200000;
  const minSpaces = 0;
  const maxSpaces = 60;

  const getX = (income) => padding + ((income - minIncome) / (maxIncome - minIncome)) * (width - padding * 2);
  const getY = (spaces) => height - padding - ((spaces - minSpaces) / (maxSpaces - minSpaces)) * (height - padding * 2);
  
  // High-contrast, publication-grade analytical color coding
  const getBubbleColor = (spaces, singleParentPct) => {
    if (spaces < 15) {
      return '#dc2626'; // Deep Crimson (Critical Desert)
    }
    if (spaces < 25) {
      if (singleParentPct >= 35) {
        return '#f97316'; // Amber-Orange (High need, moderate coverage)
      }
      return '#eab308'; // Ochre-Yellow (Transitional zone)
    }
    return '#0d9488'; // Teal-Emerald (Optimal coverage)
  };

  // Styling Variables
  const sansSerifFont = 'Inter, system-ui, -apple-system, sans-serif';
  const serifFont = 'Georgia, serif';

  return (
    <div 
      className="min-h-screen bg-gray-50 text-black p-4 md:p-8"
      style={{ fontFamily: sansSerifFont }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="bg-white p-6 md:p-8 shadow-sm border border-gray-300">
          <div className="flex flex-col gap-4">
            <div>
              {/* EXCEPTION: Kept main title size exactly the same */}
              <h1 
                className="text-3xl md:text-4xl font-normal text-black mb-6"
                style={{ fontFamily: serifFont }}
              >
                Analysis of Childcare Centres Allocation in the City of Toronto using GBA+
              </h1>
              
              {/* Increased description globally by 2pt (text-sm -> text-base, text-base -> text-lg) */}
              <div className="text-gray-700 text-base md:text-lg leading-relaxed space-y-4 pt-2">
                <p>
                  A surface-level analysis might simply suggest Toronto needs more child care. However, applying a GBA+ framework to these datasets reveals that where child care is built, and who it serves, is just as critical. Without targeting expansion in low-income, high-single-parent neighbourhoods, broad child care policies will inadvertently widen the socioeconomic and gender gap, leaving families living in the most vulnerable circumstances in child care deserts.
                </p>
                <p>
                  Using the Gender-Based Analysis Plus lens, the data matrix allows for a rigorous evaluation of three overlapping social identity factors: geography, socio-economic status, and parenthood composition.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Filter Bar */}
          <div className="mt-8 pt-6 border-t border-gray-300 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {/* EXCEPTION: Kept all action buttons exactly at text-sm */}
              <button 
                onClick={() => setActiveTab('scatter')}
                className={`px-5 py-2 text-sm font-medium border transition-colors ${activeTab === 'scatter' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-400 hover:bg-gray-100'}`}
              >
                Intersectional Scatter
              </button>
              <button 
                onClick={() => setActiveTab('simulator')}
                className={`px-5 py-2 text-sm font-medium border transition-colors ${activeTab === 'simulator' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-400 hover:bg-gray-100'}`}
              >
                Equity Sandbox Simulator
              </button>
              <button 
                onClick={() => setActiveTab('table')}
                className={`px-5 py-2 text-sm font-medium border transition-colors ${activeTab === 'table' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-400 hover:bg-gray-100'}`}
              >
                Neighbourhood Matrix
              </button>
            </div>

            <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                {/* EXCEPTION: Input matching button controls preserved at text-sm */}
                <input 
                  type="text"
                  placeholder="Search neighbourhood..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>
              {/* EXCEPTION: Kept drop down menus exactly at text-sm */}
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-white border border-gray-400 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              >
                {regions.map(r => <option key={r} value={r}>{r} Region</option>)}
              </select>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left/Middle Column based on Tab Selection */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tab 1: Intersectional Scatter */}
            {activeTab === 'scatter' && (
              <div className="bg-white border border-gray-300 p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    {/* Increased heading by 2 points (text-xl -> text-2xl) */}
                    <h2 className="text-2xl text-black mb-2" style={{ fontFamily: serifFont }}>
                      Systemic Coverage Rate Matrix
                    </h2>
                    {/* Increased caption text by 2 points (text-xs md:text-sm -> text-sm md:text-base) */}
                    <p className="text-sm md:text-base text-gray-600">
                      Bubble sizes scale by child population. Colors represent calculated access priority (Crimson indicating critical childcare deserts).
                    </p>
                  </div>
                  {/* EXCEPTION: Kept button at original text-xs */}
                  {Object.keys(simulatedSpaces).length > 0 && (
                    <button 
                      onClick={handleResetSimulation}
                      className="px-4 py-2 border border-black bg-white text-black text-xs font-medium hover:bg-gray-100 transition-colors"
                    >
                      Reset Simulation
                    </button>
                  )}
                </div>
                
                <div className="relative w-full overflow-x-auto border border-gray-200">
                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[620px] bg-gray-50">
                    {/* Grid Lines Labels increased by 2 units (fontSize 10 -> 12) */}
                    {[0, 15, 30, 45, 60].map(tick => (
                      <g key={`y-${tick}`}>
                        <line x1={padding} y1={getY(tick)} x2={width - padding} y2={getY(tick)} stroke="#e5e7eb" strokeDasharray="4 4" />
                        <text x={padding - 12} y={getY(tick) + 4} textAnchor="end" fontSize="12" fill="#6b7280">{tick}</text>
                      </g>
                    ))}
                    {[50000, 100000, 150000, 200000].map(tick => (
                      <g key={`x-${tick}`}>
                        <line x1={getX(tick)} y1={padding} x2={getX(tick)} y2={height - padding} stroke="#e5e7eb" strokeDasharray="4 4" />
                        <text x={getX(tick)} y={height - padding + 22} textAnchor="middle" fontSize="12" fill="#6b7280">${tick / 1000}k</text>
                      </g>
                    ))}

                    {/* City Average Reference Lines increased by 2 units (fontSize 9 -> 11) */}
                    <line 
                      x1={getX(CITY_AVERAGES.income)} 
                      y1={padding} 
                      x2={getX(CITY_AVERAGES.income)} 
                      y2={height - padding} 
                      stroke="#4b5563" 
                      strokeWidth="1" 
                      strokeDasharray="3 3" 
                    />
                    <text x={getX(CITY_AVERAGES.income) + 6} y={padding + 15} fontSize="11" fill="#4b5563" className="font-semibold">City Avg Income (${CITY_AVERAGES.income/1000}k)</text>

                    <line 
                      x1={padding} 
                      y1={getY(CITY_AVERAGES.spacesPer100)} 
                      x2={width - padding} 
                      y2={getY(CITY_AVERAGES.spacesPer100)} 
                      stroke="#4b5563" 
                      strokeWidth="1" 
                      strokeDasharray="3 3" 
                    />
                    <text x={width - padding - 150} y={getY(CITY_AVERAGES.spacesPer100) - 6} fontSize="11" fill="#4b5563" className="font-semibold">City Avg Coverage ({CITY_AVERAGES.spacesPer100}/100)</text>

                    {/* Axes */}
                    <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#111827" strokeWidth="1" />
                    <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#111827" strokeWidth="1" />
                    
                    {/* Axis Labels increased by 2 units (fontSize 11 -> 13) */}
                    <text x={width / 2} y={height - 12} textAnchor="middle" fontSize="13" fill="#111827" style={{ fontFamily: serifFont }}>Median Household Income ($)</text>
                    <text x={18} y={height / 2} transform={`rotate(-90 18 ${height/2})`} textAnchor="middle" fontSize="13" fill="#111827" style={{ fontFamily: serifFont }}>Licensed Spaces per 100 Children (Coverage Rate)</text>

                    {/* Data Points */}
                    {filteredData.map((node) => {
                      const cx = getX(node.income);
                      const cy = getY(node.spacesPer100);
                      const r = Math.sqrt(node.totalChildren) * 0.35; 
                      const isActive = activeNeighbourhood?.id === node.id;
                      const isMuted = activeNeighbourhood && activeNeighbourhood.id !== node.id;

                      return (
                        <g 
                          key={node.id}
                          className="transition-all duration-300 ease-in-out cursor-pointer"
                          style={{ opacity: isMuted ? 0.25 : 1 }}
                          onMouseEnter={() => setHoveredId(node.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onClick={() => setSelectedId(node.id)}
                        >
                          {/* Indicator for simulated edits */}
                          {node.isModified && (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={r + 4}
                              fill="none"
                              stroke="#000000"
                              strokeWidth="1.5"
                              strokeDasharray="2 2"
                            />
                          )}
                          
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isActive ? r + 3 : r}
                            fill={getBubbleColor(node.spacesPer100, node.singleParentPct)}
                            fillOpacity={isActive ? "1" : "0.80"}
                            stroke={isActive ? "#000000" : (node.isModified ? "#000000" : "#ffffff")}
                            strokeWidth={isActive ? 2.5 : 1}
                          />
                          {(isActive || node.spacesPer100 > 40 || node.spacesPer100 < 11) && (
                            <g className="pointer-events-none">
                              {/* Backdrop for legibility */}
                              <rect 
                                x={cx - 70} 
                                y={cy - r - 26} 
                                width="140" 
                                height="20" 
                                fill="white" 
                                rx="3"
                                fillOpacity="0.95" 
                                className="shadow-sm stroke-gray-200"
                                strokeWidth="0.5"
                              />
                              {/* Inside chart tooltip text increased by 2 points (fontSize 9.5 -> 11.5) */}
                              <text 
                                x={cx} 
                                y={cy - r - 12} 
                                textAnchor="middle" 
                                fontSize="11.5" 
                                fill="#000000"
                                className="font-medium"
                              >
                                {node.name.length > 20 ? `${node.name.slice(0, 18)}...` : node.name}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Plot Legends scaled up by 2 points (text-xs -> text-sm) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-300 text-sm text-gray-700">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-black">GBA+ Classification:</span>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#dc2626] rounded-full inline-block"></span> Critical Desert (&lt;15)</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#f97316] rounded-full inline-block"></span> High Need</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#eab308] rounded-full inline-block"></span> Transitional</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#0d9488] rounded-full inline-block"></span> Optimal (&ge;30)</div>
                  </div>
                  <div className="flex items-center md:justify-end gap-4">
                    <div className="flex items-center gap-1">
                      <span className="w-4 h-4 border border-black border-dashed rounded-full inline-block"></span>
                      <span className="font-medium">Modified / Expanded</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Policy Sandbox Simulator */}
            {activeTab === 'simulator' && (
              <div className="bg-white border border-gray-300 p-6 space-y-6">
                <div className="border-b border-gray-300 pb-4">
                  {/* Scaled up titles & descriptions by 2 points */}
                  <h2 className="text-2xl text-black mb-2" style={{ fontFamily: serifFont }}>
                    Capital Allocation Sandbox
                  </h2>
                  <p className="text-base text-gray-600">
                    Proactively target capital investments to build child care infrastructures. Choose any high-demand community below to direct physical expansion and assess spatial reform outcomes.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Quick-select target */}
                  <div className="bg-gray-50 p-5 border border-gray-300">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Target Selection</span>
                    <h3 className="text-xl text-black mt-2" style={{ fontFamily: serifFont }}>{activeNeighbourhood.name}</h3>
                    <p className="text-base text-gray-600 mt-2">Current base space capacity of {INITIAL_NEIGHBOURHOOD_DATA.find(n => n.id === activeNeighbourhood.id)?.capacity} spaces.</p>
                    
                    {/* EXCEPTION: Kept simulation button text exactly at text-sm */}
                    <button
                      onClick={() => handleSimulateSpaces(activeNeighbourhood.id)}
                      className="mt-6 w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 border border-black transition-colors text-sm"
                    >
                      Allocate +50 Spaces ($250k Est.)
                    </button>
                  </div>

                  {/* Impact Readout elements scaled up by 2 points */}
                  <div className="bg-white p-5 border border-gray-300 flex flex-col justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Simulated Impact Summary</span>
                      <div className="mt-4 space-y-3">
                        <div className="flex justify-between text-base border-b border-gray-100 pb-2">
                          <span className="text-gray-600">Added Spaces:</span>
                          <span className="font-semibold text-teal-700">+{simulatedSpaces[activeNeighbourhood.id] || 0}</span>
                        </div>
                        <div className="flex justify-between text-base border-b border-gray-100 pb-2">
                          <span className="text-gray-600">New Coverage Rate:</span>
                          <span className={`font-semibold ${activeNeighbourhood.spacesPer100 < 15 ? 'text-rose-600' : activeNeighbourhood.spacesPer100 < 30 ? 'text-amber-600' : 'text-teal-600'}`}>
                            {activeNeighbourhood.spacesPer100} / 100 kids
                          </span>
                        </div>
                        <div className="flex justify-between text-base">
                          <span className="text-gray-600">Simulated Capacity:</span>
                          <span className="font-medium text-black">{activeNeighbourhood.capacity}</span>
                        </div>
                      </div>
                    </div>
                    
                    {simulatedSpaces[activeNeighbourhood.id] > 0 && (
                      <div className="text-base text-teal-800 bg-teal-50 p-2.5 border border-teal-200 font-medium mt-4">
                        ✓ GBA+ employment access barrier lowered successfully.
                      </div>
                    )}
                  </div>
                </div>

                {/* Planning alerts and disaggregated cards scaled up by 2 points */}
                <div className="pt-4">
                  <h4 className="text-sm font-semibold text-rose-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                    Allocation planning using disaggregated data.
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {processedData
                      .filter(n => n.spacesPer100 < 15)
                      .slice(0, 3)
                      .map(item => (
                        <div 
                          key={item.id} 
                          onClick={() => setSelectedId(item.id)}
                          className={`p-4 border text-left cursor-pointer transition-colors relative overflow-hidden ${selectedId === item.id ? 'bg-red-50 border-red-500' : 'bg-white hover:bg-gray-50 border-red-200'}`}
                        >
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>
                          <div className="text-base font-semibold text-black truncate mb-2 pl-2">{item.name}</div>
                          <div className="flex justify-between items-center text-sm text-gray-600 pl-2">
                            <span className="text-red-700 font-medium">Coverage: {item.spacesPer100}/100</span>
                            <span className="text-black">{item.singleParentPct}% Single Parent</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Comparative Matrix */}
            {activeTab === 'table' && (
              <div className="bg-white border border-gray-300 p-6 overflow-hidden">
                <div className="mb-6 border-b border-gray-300 pb-4">
                  {/* Title scaled up from text-xl -> text-2xl */}
                  <h2 className="text-2xl text-black" style={{ fontFamily: serifFont }}>Neighbourhood Comparative Matrix</h2>
                </div>

                <div className="overflow-x-auto border border-gray-300">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      {/* Matrix headers increased from text-xs -> text-sm */}
                      <tr className="bg-gray-100 text-gray-700 text-sm font-semibold uppercase border-b border-gray-300">
                        <th className="p-4 border-r border-gray-200">Neighbourhood</th>
                        <th className="p-4 border-r border-gray-200">Region</th>
                        <th className="p-4 border-r border-gray-200">Household Income</th>
                        <th className="p-4 border-r border-gray-200">Single Parent Ratio</th>
                        <th className="p-4 text-center">Spaces / 100 Kids</th>
                      </tr>
                    </thead>
                    {/* Matrix row contents increased from text-sm -> text-base */}
                    <tbody className="text-base divide-y divide-gray-200">
                      {filteredData.map(item => {
                        const statusColorClass = 
                          item.spacesPer100 < 15 ? 'text-red-600 bg-red-50 font-bold' : 
                          item.spacesPer100 < 30 ? 'text-amber-700 bg-amber-50 font-medium' : 
                          'text-teal-700 bg-teal-50 font-semibold';
                        return (
                          <tr 
                            key={item.id} 
                            className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedId === item.id ? 'bg-gray-100 text-black border-l-4 border-l-black' : 'text-gray-800'}`}
                            onClick={() => setSelectedId(item.id)}
                          >
                            <td className="p-4 font-medium border-r border-gray-200">{item.name}</td>
                            <td className="p-4 text-gray-600 border-r border-gray-200">{item.region}</td>
                            <td className="p-4 border-r border-gray-200">${item.income.toLocaleString()}</td>
                            <td className="p-4 border-r border-gray-200">
                              {item.singleParentPct}%
                            </td>
                            <td className={`p-4 text-center ${statusColorClass}`}>
                              {item.spacesPer100}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* GBA+ Insight Panel scaled up by 2 points (text-xl heading and text-base paragraph) */}
            <div className={`bg-white border border-gray-300 border-l-4 p-6 transition-all duration-300 ${activeNeighbourhood.spacesPer100 < 15 ? 'border-l-red-600 bg-red-50/20' : 'border-l-black'}`}>
              <h3 className="text-xl text-black mb-4 font-semibold" style={{ fontFamily: serifFont }}>
                Intersectional GBA+ Lens Case Analysis
              </h3>
              {activeNeighbourhood ? (
                activeNeighbourhood.spacesPer100 < 15 ? (
                   <p className="leading-relaxed text-base text-gray-800">
                    <strong className="text-red-700">{activeNeighbourhood.name}</strong> exemplifies a systemic child care desert. With an average household income of <strong>${activeNeighbourhood.income.toLocaleString()}</strong> and <strong className="text-red-600">{activeNeighbourhood.singleParentPct}%</strong> single-parent families (predominantly women), families are faced with extreme structural disadvantages. Directing provincial <em>CWELCC ($10-a-day)</em> funds here without building physical capacity is practically useless because the waiting lists exceed child population limits by over 6:1.
                  </p>
                ) : activeNeighbourhood.spacesPer100 > 35 ? (
                  <p className="leading-relaxed text-base text-gray-800">
                    <strong className="text-teal-700">{activeNeighbourhood.name}</strong> demonstrates the "Affluence Advantage." Higher median household incomes of <strong>${activeNeighbourhood.income.toLocaleString()}</strong> attract commercial, market-driven childcare options. Combined with low rates of lone-parent reliance (<strong>{activeNeighbourhood.singleParentPct}%</strong>), women in this community experience significantly fewer geographic barriers to entering or maintaining full-time careers.
                  </p>
                ) : (
                  <p className="leading-relaxed text-base text-gray-800">
                    <strong>{activeNeighbourhood.name}</strong> operates as a transitional zone. With a coverage rate of <strong>{activeNeighbourhood.spacesPer100}</strong> spaces per 100 children and {activeNeighbourhood.singleParentPct}% of families being single-parents, localized targeting of subsidies is vital to preserve work flexibility and stop childcare costs from locking single parents into systemic underemployment.
                  </p>
                )
              ) : (
                <p className="leading-relaxed text-base text-gray-500 italic">
                  Hover or select a neighborhood in any panel to run live GBA+ impact analysis.
                </p>
              )}
            </div>

          </div>

          {/* Right Sidebar: Neighbourhood Details scaled up by 2 points throughout */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-300 p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-300">
                  <h2 className="text-xl text-black font-semibold" style={{ fontFamily: serifFont }}>
                    Neighbourhood Profile
                  </h2>
                </div>
                
                {activeNeighbourhood ? (
                  <div className="space-y-8">
                    <div>
                      <div className="text-sm text-gray-500 font-semibold tracking-wider uppercase mb-1">{activeNeighbourhood.region} Sector</div>
                      <div className="text-2xl text-black font-bold" style={{ fontFamily: serifFont }}>{activeNeighbourhood.name}</div>
                    </div>

                    {/* Regional Benchmarks meters adjusted up by 2 points */}
                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
                          <span>Median Income</span>
                          <span className={activeNeighbourhood.income < CITY_AVERAGES.income ? 'text-red-600 font-bold' : 'text-teal-600 font-bold'}>
                            {activeNeighbourhood.income < CITY_AVERAGES.income ? 'Potential Need' : 'Above Avg'}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 w-full rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${activeNeighbourhood.income < CITY_AVERAGES.income ? 'bg-red-500' : 'bg-teal-600'}`}
                            style={{ width: `${Math.min((activeNeighbourhood.income / maxIncome) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-base font-semibold text-black">${activeNeighbourhood.income.toLocaleString()}</span>
                          <span className="text-[12px] text-gray-500 font-medium">City Avg: ${CITY_AVERAGES.income.toLocaleString()}</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
                          <span>Single-Parent Households</span>
                          <span className={activeNeighbourhood.singleParentPct > CITY_AVERAGES.singleParentPct ? 'text-orange-600 font-bold' : 'text-teal-600 font-bold'}>
                            {activeNeighbourhood.singleParentPct > CITY_AVERAGES.singleParentPct ? 'High Need' : 'Low Need'}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 w-full rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${activeNeighbourhood.singleParentPct > CITY_AVERAGES.singleParentPct ? 'bg-orange-500' : 'bg-teal-600'}`}
                            style={{ width: `${activeNeighbourhood.singleParentPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-base font-semibold text-black">{activeNeighbourhood.singleParentPct}%</span>
                          <span className="text-[12px] text-gray-500 font-medium">City Avg: {CITY_AVERAGES.singleParentPct}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-5 border border-gray-300">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        Physical Capacity Metrics
                      </h4>
                      <div className="space-y-3 text-base text-black">
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-600">Children in Area:</span>
                          <span className="font-semibold">{activeNeighbourhood.totalChildren.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-600">Licensed Spaces:</span>
                          <span className="font-semibold">{activeNeighbourhood.capacity.toLocaleString()}</span>
                        </div>
                        <div className="pt-2 flex justify-between items-end">
                          <span className="font-semibold text-sm text-gray-600">Coverage Index:</span>
                          <span className={`text-2xl font-bold ${activeNeighbourhood.spacesPer100 < 15 ? 'text-red-600' : 'text-teal-700'}`}>
                            {activeNeighbourhood.spacesPer100} <span className="text-sm text-gray-500 font-normal">spaces / 100 kids</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Gender Impact Advisory adjusted up by 2 points */}
                    <div className={`p-5 border text-sm space-y-3 bg-white ${activeNeighbourhood.spacesPer100 < 15 ? 'border-red-300' : 'border-gray-300'}`}>
                      <span className={`font-bold uppercase tracking-wider block ${activeNeighbourhood.spacesPer100 < 15 ? 'text-red-700' : 'text-gray-700'}`}>
                        GBA+ Assessment
                      </span>
                      {activeNeighbourhood.spacesPer100 < 15 ? (
                        <div className="text-black leading-relaxed">
                          The physical shortage in <strong className="text-red-700">{activeNeighbourhood.name}</strong> acts as a direct economic barrier for women. With low incomes, private, un-subsidized care is inaccessible, leading to severe localized wage loss.
                        </div>
                      ) : (
                        <div className="text-black leading-relaxed">
                          Infrastructure in <strong>{activeNeighbourhood.name}</strong> is relatively well-integrated. Priorities should shift to ensuring low-income parent priority queue access.
                        </div>
                      )}
                    </div>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-500 text-base">
                    <p>Select a neighborhood bubble on the plot to analyze gender equity profiles.</p>
                  </div>
                )}
              </div>

              {/* Sidebar Action - EXCEPTION: Preserved internal button sizing standard at text-sm */}
              {activeNeighbourhood && activeTab !== 'simulator' && (
                <div className="mt-6 pt-6 border-t border-gray-300">
                  <button
                    onClick={() => {
                      setActiveTab('simulator');
                    }}
                    className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 border border-black transition-colors text-sm"
                  >
                    Simulate Capital Expansion Here
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
