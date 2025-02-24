// Export the shared data

import "./Plan.css"

export const machiningProcesses = {
    C1: { name: 'VMC Imported', rate: 2500 },
    C2: { name: 'VMC Local', rate: 1800 },
    C3: { name: 'Milling Manual', rate: 1200 },
    C4: { name: 'Grinding Final', rate: 1500 },
    C5: { name: 'CNC Lathe', rate: 2200 },
    C6: { name: 'Drill/Tap', rate: 800 },
    C7: { name: 'Wire Cut Local', rate: 1600 },
    C8: { name: 'Wire Cut Rough', rate: 1400 },
    C9: { name: 'Wire Cut Imported', rate: 2800 },
    C11: { name: 'Black Oxide', rate: 600 },
    C12: { name: 'Laser Marking', rate: 1000 },
    C13: { name: 'Lapping/Polishing', rate: 900 },
    C14: { name: 'Grinding Blank/Rough', rate: 1300 },
    C15: { name: 'Gauges & fixtures', rate: 1700 },
    C17: { name: 'Cylindrical Grinding', rate: 1900 },
    C18: { name: 'Manual Lathe', rate: 1100 },
    C19: { name: 'Hydraulic Grinding', rate: 2000 }
  };
  
  export const partsData = [
    { 
      id: 1, 
      name: 'SF BODY (RS-EM) -NEW', 
      costPerUnit: 150, 
      machiningHours: 6.5, 
      quantity: 1,
      processes: [
        { code: 'C1', time: '2h 15m' },
        { code: 'C3', time: '4h 30m' },
        { code: 'C11', time: '1h 45m' }
      ]
    },
    { 
      id: 2, 
      name: 'Bottom Base Plate (RSSF-PN-SB)', 
      costPerUnit: 85, 
      machiningHours: 4.25, 
      quantity: 1,
      processes: [
        { code: 'C2', time: '1h 30m' },
        { code: 'C4', time: '2h 00m' },
        { code: 'C12', time: '0h 45m' }
      ]
    },
    { 
      id: 3, 
      name: 'Retainer Plate (RSSF-MECH)', 
      costPerUnit: 95, 
      machiningHours: 3.75, 
      quantity: 1,
      processes: [
        { code: 'C5', time: '1h 45m' },
        { code: 'C6', time: '1h 00m' },
        { code: 'C13', time: '1h 00m' }
      ]
    },
    { 
      id: 4, 
      name: 'Shaft Plunger (RSSF-MECH)', 
      costPerUnit: 120, 
      machiningHours: 5.5, 
      quantity: 1,
      processes: [
        { code: 'C7', time: '2h 30m' },
        { code: 'C17', time: '2h 00m' },
        { code: 'C14', time: '1h 00m' }
      ]
    },
    { 
      id: 5, 
      name: 'Rod Holder (RSSF-MECH)', 
      costPerUnit: 75, 
      machiningHours: 3.25, 
      quantity: 1,
      processes: [
        { code: 'C18', time: '1h 15m' },
        { code: 'C6', time: '1h 00m' },
        { code: 'C13', time: '1h 00m' }
      ]
    },
    { 
      id: 6, 
      name: 'Shaft Rod (RSSF-MECH)', 
      costPerUnit: 110, 
      machiningHours: 4.75, 
      quantity: 1,
      processes: [
        { code: 'C5', time: '2h 00m' },
        { code: 'C17', time: '1h 45m' },
        { code: 'C13', time: '1h 00m' }
      ]
    },
    { 
      id: 7, 
      name: 'Square Pin (RSSF-MECH)', 
      costPerUnit: 45, 
      machiningHours: 2.5, 
      quantity: 1,
      processes: [
        { code: 'C18', time: '1h 00m' },
        { code: 'C14', time: '1h 00m' },
        { code: 'C11', time: '0h 30m' }
      ]
    },
    { 
      id: 8, 
      name: 'Cam Roller Pin (RSSF-MECH)', 
      costPerUnit: 65, 
      machiningHours: 3.0, 
      quantity: 1,
      processes: [
        { code: 'C5', time: '1h 30m' },
        { code: 'C17', time: '1h 00m' },
        { code: 'C12', time: '0h 30m' }
      ]
    },
    { 
      id: 9, 
      name: 'Cam Roller (RSSF-MECH)', 
      costPerUnit: 90, 
      machiningHours: 4.0, 
      quantity: 1,
      processes: [
        { code: 'C1', time: '1h 45m' },
        { code: 'C4', time: '1h 45m' },
        { code: 'C13', time: '0h 30m' }
      ]
    },
    { 
      id: 10, 
      name: 'Square Spacer (RSSF-MECH)', 
      costPerUnit: 40, 
      machiningHours: 2.25, 
      quantity: 1,
      processes: [
        { code: 'C18', time: '1h 00m' },
        { code: 'C6', time: '0h 45m' },
        { code: 'C11', time: '0h 30m' }
      ]
    },
    { 
      id: 11, 
      name: 'Flat Ring (RSSF-MECH)', 
      costPerUnit: 55, 
      machiningHours: 2.75, 
      quantity: 1,
      processes: [
        { code: 'C5', time: '1h 15m' },
        { code: 'C4', time: '1h 00m' },
        { code: 'C12', time: '0h 30m' }
      ]
    }
  ].map(part => ({ ...part, isExpanded: false }));
  
  export function setupProjectPage(element) {
    function formatHoursMinutes(hours) {
      if (hours === 0) return '-';
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      if (h === 0 && m === 0) return '-';
      return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`;
    }
  
    function parseTimeToHours(timeStr) {
      const [h, m] = timeStr.replace('h', '').replace('m', '').split(' ').map(Number);
      return h + (m / 60);
    }
  
    function calculateProcessTime(baseTime, quantity) {
      const hours = parseTimeToHours(baseTime);
      return formatHoursMinutes(hours * quantity);
    }
  
    function renderProjectDetails() {
      return `
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 class="text-2xl font-bold text-gray-800 mb-2">Project: Manufacturing Allocation</h1>
          <p class="text-gray-600">Project ID: PRJ-2024-001</p>
        </div>
      `;
    }
  
    function calculateTotals(part) {
      return {
        totalCost: part.costPerUnit * part.quantity,
        totalMachiningHours: part.machiningHours * part.quantity
      };
    }
  
    function togglePartExpansion(id) {
      const partIndex = partsData.findIndex(p => p.id === id);
      if (partIndex !== -1) {
        partsData[partIndex].isExpanded = !partsData[partIndex].isExpanded;
        renderTable();
      }
    }
  
    function renderProcessDetails(part) {
      if (!part.isExpanded) return '';
      
      return `
        <tr class="bg-gray-50">
          <td colspan="7" class="px-6 py-4">
            <div class="border rounded-lg bg-white p-4">
              <h3 class="font-semibold text-gray-800 mb-3">Machining Processes for ${part.name}</h3>
              <table class="min-w-full">
                <thead>
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Process Code</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Process Name</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Base Time</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Time</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate (₹/hr)</th>
                  </tr>
                </thead>
                <tbody>
                  ${part.processes.map(process => `
                    <tr>
                      <td class="px-4 py-2 text-sm">${process.code}</td>
                      <td class="px-4 py-2 text-sm">${machiningProcesses[process.code].name}</td>
                      <td class="px-4 py-2 text-sm">${part.quantity}</td>
                      <td class="px-4 py-2 text-sm">${process.time}</td>
                      <td class="px-4 py-2 text-sm">${calculateProcessTime(process.time, part.quantity)}</td>
                      <td class="px-4 py-2 text-sm">₹${machiningProcesses[process.code].rate}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      `;
    }
  
    function renderTable() {
      const tableHTML = `
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Per Unit</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machining Hours</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Machining Hours</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              ${partsData.map(part => {
                const { totalCost, totalMachiningHours } = calculateTotals(part);
                return `
                  <tr class="cursor-pointer hover:bg-gray-50" onclick="window.togglePartExpansion(${part.id})">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${part.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹${part.costPerUnit.toFixed(2)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatHoursMinutes(part.machiningHours)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input 
                        type="number" 
                        min="0" 
                        value="${part.quantity}"
                        class="w-20 px-2 py-1 border rounded"
                        onchange="window.updatePartQuantity(${part.id}, this.value)"
                        onclick="event.stopPropagation()"
                      >
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹${totalCost.toFixed(2)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatHoursMinutes(totalMachiningHours)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button 
                        class="text-blue-600 hover:text-blue-800 mr-3"
                        onclick="event.stopPropagation()"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                        </svg>
                      </button>
                      <button 
                        class="text-red-600 hover:text-red-800"
                        onclick="event.stopPropagation()"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  ${renderProcessDetails(part)}
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
  
      element.innerHTML = renderProjectDetails() + tableHTML;
    }
  
    // Initialize the page
    renderTable();
  
    // Add global handlers
    window.updatePartQuantity = (id, quantity) => {
      const partIndex = partsData.findIndex(p => p.id === id);
      if (partIndex !== -1) {
        partsData[partIndex].quantity = parseInt(quantity) || 0;
        renderTable();
      }
    };
  
    window.togglePartExpansion = (id) => {
      togglePartExpansion(id);
    };
  }