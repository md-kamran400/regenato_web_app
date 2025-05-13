// ============================================ PART-LIST CODE START ===============================


// Route to update partsListName

// partproject.get(
//   "/projects/:projectId/partsLists/:listId/items",
//   async (req, res) => {
//     try {
//       const { projectId, listId } = req.params;
//       const project = await PartListProjectModel.findById(projectId);

//       if (!project) {
//         return res
//           .status(404)
//           .json({ status: "error", message: "Project not found" });
//       }

//       const partsList = project.partsLists.id(listId);
//       if (!partsList) {
//         return res
//           .status(404)
//           .json({ status: "error", message: "Parts list not found" });
//       }

//       // Map through items and ensure dailyPlannedQty is included
//       const itemsWithDailyPlanned = partsList.partsListItems.map(item => {
//         const allocationsWithDailyPlanned = item.allocations.map(alloc => {
//           return {
//             ...alloc.toObject(),
//             allocations: alloc.allocations.map(a => ({
//               ...a.toObject(),
//               dailyPlannedQty: a.dailyPlannedQty || 
//                 (a.shiftTotalTime && a.perMachinetotalTime 
//                   ? Math.floor(a.shiftTotalTime / a.perMachinetotalTime)
//                   : 0)
//             }))
//           };
//         });
        
//         return {
//           ...item.toObject(),
//           allocations: allocationsWithDailyPlanned
//         };
//       });

//       res.status(200).json({
//         status: "success",
//         message: "Parts list items retrieved successfully",
//         data: itemsWithDailyPlanned,
//       });
//     } catch (error) {
//       res.status(500).json({ status: "error", message: error.message });
//     }
//   }
// );



// ============================================ part allocation ===============================

// partproject.post(
//   "/projects/:projectId/partsLists/:partsListId/partsListItems/:partsListItemsId/allocation",
//   async (req, res) => {
//     try {
//       const { projectId, partsListId, partsListItemsId } = req.params;
//       const { allocations } = req.body;

//       if (!Array.isArray(allocations) || allocations.length === 0) {
//         return res.status(400).json({ message: "Invalid allocation data" });
//       }

//       // Find the project that contains the given partsListId
//       const project = await PartListProjectModel.findOne({ _id: projectId });

//       if (!project) {
//         return res.status(404).json({ message: "Project not found" });
//       }

//       // Find the correct parts list
//       const partsList = project.partsLists.find(
//         (list) => list._id.toString() === partsListId
//       );

//       if (!partsList) {
//         return res.status(404).json({ message: "Parts List not found" });
//       }

//       // Find the correct part inside the parts list
//       const partItem = partsList.partsListItems.find(
//         (item) => item._id.toString() === partsListItemsId
//       );

//       if (!partItem) {
//         return res.status(404).json({ message: "Part List Item not found" });
//       }

//       // Clear existing allocations first
//       partItem.allocations = [];

//       // Add new allocations
//       allocations.forEach((alloc) => {
//         const newAllocation = {
//           partName: alloc.partName,
//           processName: alloc.processName,
//           processId: alloc.processId,
//           partsCodeId: alloc.partsCodeId,
//           allocations: alloc.allocations.map(a => ({
//             ...a,
//             dailyPlannedQty: Math.floor(a.shiftTotalTime / a.perMachinetotalTime),
//             dailyTracking: []
//           }))
//         };
//         partItem.allocations.push(newAllocation);
//       });

//       // Calculate and update status
//       const status = partItem.calculateStatus();
//       partItem.status = status.text;
//       partItem.statusClass = status.class;

//       // Save the updated project
//       await project.save();

//       res.status(201).json({
//         message: "Allocations added successfully",
//         data: {
//           ...partItem.toObject(),
//           status: status.text,
//           statusClass: status.class
//         }
//       });
//     } catch (error) {
//       console.error("Error adding allocations:", error);
//       res.status(500).json({ message: "Server error", error: error.message });
//     }
//   }
// );


// partproject.delete(
//   "/projects/:projectId/partsLists/:partsListId/partsListItems/:partsListItemsId/allocation",
//   async (req, res) => {
//     try {
//       const { projectId, partsListId, partsListItemsId } = req.params;

//       // Find the project
//       const project = await PartListProjectModel.findOne({ _id: projectId });

//       if (!project) {
//         return res.status(404).json({ message: "Project not found" });
//       }

//       // Find the correct parts list
//       const partsList = project.partsLists.find(
//         (list) => list._id.toString() === partsListId
//       );

//       if (!partsList) {
//         return res.status(404).json({ message: "Parts List not found" });
//       }

//       // Find the correct part inside the parts list
//       const partItem = partsList.partsListItems.find(
//         (item) => item._id.toString() === partsListItemsId
//       );

//       if (!partItem) {
//         return res.status(404).json({ message: "Part List Item not found" });
//       }

//       // Clear all allocations
//       partItem.allocations = [];

//         // Update status
//       partItem.status = "Not Allocated";
//       partItem.statusClass = "badge bg-info text-white";

//       // Save the updated project
//       await project.save();

//       res.status(200).json({
//         message: "All allocations deleted successfully",
//       });
//     } catch (error) {
//       console.error("Error deleting allocations:", error);
//       res.status(500).json({ message: "Server error", error: error.message });
//     }
//   }
// );

// const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// partproject.get(
//   "/projects/:projectId/partsLists/:partsListId/partsListItems/:partsListItemsId/allocation",
//   async (req, res) => {
//     try {
//       const { projectId, partsListId, partsListItemsId } = req.params;

//       // Validate IDs
//       if (
//         !isValidObjectId(projectId) ||
//         !isValidObjectId(partsListId) ||
//         !isValidObjectId(partsListItemsId)
//       ) {
//         return res.status(400).json({ message: "Invalid or missing ID(s)" });
//       }

//       // Find the project
//       const project = await PartListProjectModel.findById(projectId);
//       if (!project) {
//         return res.status(404).json({ message: "Project not found" });
//       }

//       // Find the parts list
//       const partsList = project.partsLists.find(
//         (list) => list._id.toString() === partsListId
//       );
//       if (!partsList) {
//         return res.status(404).json({ message: "Parts List not found" });
//       }

//       // Find the part item
//       const partItem = partsList.partsListItems.find(
//         (item) => item._id.toString() === partsListItemsId
//       );
//       if (!partItem) {
//         return res.status(404).json({ message: "Part List Item not found" });
//       }

//       // Send response with daily tracking included
//       res.status(200).json({
//         message: "Allocations retrieved successfully",
//         data: partItem.allocations.map((allocation) => ({
//           ...allocation.toObject(),
//           dailyTracking: allocation.dailyTracking,
//         })),
//       });
//     } catch (error) {
//       console.error("Error retrieving allocations:", error);
//       res.status(500).json({ message: "Server error", error: error.message });
//     }
//   }
// );

// // partproject.post(
// //   "/projects/:projectId/partsLists/:partsListId/partsListItems/:partListItemId/allocations/:processId/allocations/:allocationId/dailyTracking",
// //   async (req, res) => {
// //     try {
// //       const {
// //         projectId,
// //         partsListId,
// //         partListItemId,
// //         processId,
// //         allocationId,
// //       } = req.params;
// //       const { date, planned, produced, operator, dailyStatus } = req.body;

// //       // Validate inputs
// //       if (!date || isNaN(new Date(date))) {
// //         return res.status(400).json({ error: "Invalid date" });
// //       }
// //       if (isNaN(planned) || isNaN(produced)) {
// //         return res.status(400).json({ error: "Planned and produced must be numbers" });
// //       }

// //       // Find the project
// //       const project = await PartListProjectModel.findById(projectId);
// //       if (!project) {
// //         return res.status(404).json({ error: "Project not found" });
// //       }

// //       // Find the parts list
// //       const partsList = project.partsLists.id(partsListId);
// //       if (!partsList) {
// //         return res.status(404).json({ error: "Parts List not found" });
// //       }

// //       // Find the part item
// //       const partItem = partsList.partsListItems.id(partListItemId);
// //       if (!partItem) {
// //         return res.status(404).json({ error: "Part List Item not found" });
// //       }

// //       // Find the process
// //       const process = partItem.allocations.id(processId);
// //       if (!process) {
// //         return res.status(404).json({ error: "Process not found" });
// //       }

// //       // Find the allocation
// //       const allocation = process.allocations.id(allocationId);
// //       if (!allocation) {
// //         return res.status(404).json({ error: "Allocation not found" });
// //       }

// //       // Calculate daily planned quantity safely
// //       const shiftTotalTime = allocation.shiftTotalTime || 510; // Default to 8.5 hours if not set
// //       const perMachinetotalTime = allocation.perMachinetotalTime || 0;
// //       const plannedQuantity = allocation.plannedQuantity || 0;

// //       let dailyPlannedQty = 0;

// //       if (perMachinetotalTime > 0) {
// //         const totalTimeRequired = plannedQuantity * perMachinetotalTime;
// //         dailyPlannedQty =
// //           totalTimeRequired <= shiftTotalTime
// //             ? plannedQuantity
// //             : Math.floor(shiftTotalTime / perMachinetotalTime);
// //       }

// //       allocation.dailyPlannedQty = dailyPlannedQty;

// //       // Check if tracking for this date already exists
// //       const existingTrackingIndex = allocation.dailyTracking.findIndex(
// //         (track) => new Date(track.date).toDateString() === new Date(date).toDateString()
// //       );

// //       if (existingTrackingIndex >= 0) {
// //         // Update existing entry
// //         allocation.dailyTracking[existingTrackingIndex] = {
// //           date,
// //           planned,
// //           produced,
// //           operator,
// //           dailyStatus,
// //         };
// //       } else {
// //         // Add new entry
// //         allocation.dailyTracking.push({
// //           date,
// //           planned,
// //           produced,
// //           operator,
// //           dailyStatus,
// //         });
// //       }

// //       // Sort tracking by date
// //       allocation.dailyTracking.sort(
// //         (a, b) => new Date(a.date) - new Date(b.date)
// //       );

// //       // Calculate cumulative production and status
// //       let cumulativeProduced = 0;
// //       let cumulativePlanned = 0;
// //       let deficit = 0;
// //       let surplus = 0;
// //       let totalDays = 0;

// //       allocation.dailyTracking.forEach((entry) => {
// //         cumulativeProduced += entry.produced;
// //         cumulativePlanned += entry.planned;
// //         totalDays++;

// //         const dailyDiff = entry.produced - entry.planned;
// //         if (dailyDiff < 0) {
// //           deficit += Math.abs(dailyDiff);
// //         } else if (dailyDiff > 0) {
// //           if (deficit > 0) {
// //             const usedToCover = Math.min(deficit, dailyDiff);
// //             deficit -= usedToCover;
// //             surplus += dailyDiff - usedToCover;
// //           } else {
// //             surplus += dailyDiff;
// //           }
// //         }
// //       });

// //       // Calculate production rate
// //       const productionRate = cumulativeProduced / totalDays || 0;
// //       const remainingQuantity = plannedQuantity - cumulativeProduced;
// //       const estimatedRemainingDays = remainingQuantity / productionRate || 0;

// //       // Calculate actual end date
// //       const originalEndDate = new Date(allocation.endDate);
// //       const currentDate = new Date();
// //       let actualEndDate = new Date(originalEndDate);

// //       if (cumulativeProduced >= plannedQuantity) {
// //         // Production completed
// //         const lastTrackingDate = new Date(
// //           allocation.dailyTracking[allocation.dailyTracking.length - 1].date
// //         );
// //         actualEndDate = lastTrackingDate;
// //       } else if (productionRate > 0) {
// //         // Adjust end date based on production rate
// //         actualEndDate = new Date(currentDate);
// //         actualEndDate.setDate(actualEndDate.getDate() + estimatedRemainingDays);
// //       }

// //       // Adjust for weekends and holidays
// //       const isWorkingDay = (date) => {
// //         // Skip Sundays (0 is Sunday)
// //         if (date.getDay() === 0) return false;
// //         // Add holiday logic here if needed
// //         return true;
// //       };

// //       while (!isWorkingDay(actualEndDate)) {
// //         actualEndDate.setDate(actualEndDate.getDate() + 1);
// //       }

// //       allocation.actualEndDate = actualEndDate;

// //       // Determine overall status
// //       let overallStatus = "On Track";
// //       if (cumulativeProduced < cumulativePlanned) {
// //         overallStatus = "Delayed";
// //       } else if (cumulativeProduced > cumulativePlanned) {
// //         overallStatus = "Ahead";
// //       }

// //       // Update the last tracking entry's status if needed
// //       if (allocation.dailyTracking.length > 0) {
// //         const lastEntry = allocation.dailyTracking[allocation.dailyTracking.length - 1];
// //         lastEntry.dailyStatus = overallStatus;
// //       }

// //       // Save updated project
// //       await project.save();

// //       // Recalculate and update part status
// //       const status = partItem.calculateStatus();
// //       partItem.status = status.text;
// //       partItem.statusClass = status.class;

// //       await project.save();

// //       // Prepare response
// //       const responseData = {
// //         _id: partItem._id,
// //         partName: partItem.partName,
// //         status: partItem.status,
// //         statusClass: partItem.statusClass,
// //         allocations: partItem.allocations.map((alloc) => ({
// //           _id: alloc._id,
// //           processName: alloc.processName,
// //           allocations: alloc.allocations.map((a) => ({
// //             _id: a._id,
// //             plannedQuantity: a.plannedQuantity,
// //             startDate: a.startDate,
// //             endDate: a.endDate,
// //             actualEndDate: a.actualEndDate,
// //             dailyTracking: a.dailyTracking,
// //             status: overallStatus,
// //           })),
// //         })),
// //       };

// //       res.status(200).json({
// //         status: "success",
// //         message: "Daily tracking updated successfully",
// //         data: responseData,
// //       });
// //     } catch (error) {
// //       console.error("Error updating daily tracking:", error);
// //       res.status(500).json({
// //         status: "error",
// //         message: "Failed to update daily tracking",
// //         error: error.message,
// //       });
// //     }
// //   }
// // );

// partproject.post(
//   "/projects/:projectId/partsLists/:partsListId/partsListItems/:partListItemId/allocations/:processId/allocations/:allocationId/dailyTracking",
//   async (req, res) => {
//     try {
//       const {
//         projectId,
//         partsListId,
//         partListItemId,
//         processId,
//         allocationId,
//       } = req.params;
//       const { date, planned, produced, operator, dailyStatus } = req.body;

//       // Validate inputs
//       if (!date || isNaN(new Date(date))) {
//         return res.status(400).json({ error: "Invalid date" });
//       }
//       if (isNaN(planned) || isNaN(produced)) {
//         return res.status(400).json({ 
//           error: "Planned and produced must be numbers" 
//         });
//       }

//       // Find the project with necessary data populated
//       const project = await PartListProjectModel.findById(projectId);
//       if (!project) {
//         return res.status(404).json({ error: "Project not found" });
//       }

//       // Find the parts list
//       const partsList = project.partsLists.id(partsListId);
//       if (!partsList) {
//         return res.status(404).json({ error: "Parts List not found" });
//       }

//       // Find the part item
//       const partItem = partsList.partsListItems.id(partListItemId);
//       if (!partItem) {
//         return res.status(404).json({ error: "Part List Item not found" });
//       }

//       // Find the process
//       const process = partItem.allocations.id(processId);
//       if (!process) {
//         return res.status(404).json({ error: "Process not found" });
//       }

//       // Find the allocation
//       const allocation = process.allocations.id(allocationId);
//       if (!allocation) {
//         return res.status(404).json({ error: "Allocation not found" });
//       }

//       // Calculate daily planned quantity with safeguards
//       const shiftTotalTime = allocation.shiftTotalTime || 510; // Default to 8.5 hours (510 minutes)
//       const perMachinetotalTime = allocation.perMachinetotalTime || 1; // Prevent division by zero
//       const plannedQuantity = allocation.plannedQuantity || 0;

//       let dailyPlannedQty = plannedQuantity; // Default to total quantity
      
//       if (perMachinetotalTime > 0) {
//         const totalTimeRequired = plannedQuantity * perMachinetotalTime;
//         dailyPlannedQty = 
//           totalTimeRequired <= shiftTotalTime
//             ? plannedQuantity
//             : Math.floor(shiftTotalTime / perMachinetotalTime);
//       }

//       // Update the allocation with calculated daily planned quantity
//       allocation.dailyPlannedQty = dailyPlannedQty;

//       // Check if tracking for this date already exists
//       const existingTrackingIndex = allocation.dailyTracking.findIndex(
//         (track) => new Date(track.date).toDateString() === new Date(date).toDateString()
//       );

//       const newTrackingEntry = {
//         date,
//         planned: Number(planned),
//         produced: Number(produced),
//         operator,
//         dailyStatus: dailyStatus || "On Track"
//       };

//       if (existingTrackingIndex >= 0) {
//         // Update existing entry
//         allocation.dailyTracking[existingTrackingIndex] = newTrackingEntry;
//       } else {
//         // Add new entry
//         allocation.dailyTracking.push(newTrackingEntry);
//       }

//       // Sort tracking by date
//       allocation.dailyTracking.sort(
//         (a, b) => new Date(a.date) - new Date(b.date)
//       );

//       // Calculate cumulative production metrics
//       let cumulativeProduced = 0;
//       let cumulativePlanned = 0;
//       let deficit = 0;
//       let surplus = 0;
//       let totalDays = allocation.dailyTracking.length;

//       allocation.dailyTracking.forEach((entry) => {
//         cumulativeProduced += entry.produced || 0;
//         cumulativePlanned += entry.planned || 0;

//         const dailyDiff = (entry.produced || 0) - (entry.planned || 0);
//         if (dailyDiff < 0) {
//           deficit += Math.abs(dailyDiff);
//         } else if (dailyDiff > 0) {
//           if (deficit > 0) {
//             const usedToCover = Math.min(deficit, dailyDiff);
//             deficit -= usedToCover;
//             surplus += dailyDiff - usedToCover;
//           } else {
//             surplus += dailyDiff;
//           }
//         }
//       });

//       // Calculate production rate and estimated completion
//       const productionRate = totalDays > 0 ? cumulativeProduced / totalDays : 0;
//       const remainingQuantity = Math.max(0, plannedQuantity - cumulativeProduced);
//       const estimatedRemainingDays = productionRate > 0 
//         ? Math.ceil(remainingQuantity / productionRate) 
//         : 0;

//       // Calculate actual end date
//       const originalEndDate = new Date(allocation.endDate);
//       let actualEndDate = new Date(originalEndDate);

//       if (cumulativeProduced >= plannedQuantity) {
//         // Production completed - use last tracking date
//         const lastTrackingDate = new Date(
//           allocation.dailyTracking[allocation.dailyTracking.length - 1].date
//         );
//         actualEndDate = lastTrackingDate;
//       } else if (productionRate > 0) {
//         // Adjust end date based on production rate
//         const today = new Date();
//         actualEndDate = new Date(today);
//         actualEndDate.setDate(actualEndDate.getDate() + estimatedRemainingDays);
//       }

//       // Adjust for weekends and holidays
//       const isWorkingDay = (date) => {
//         return date.getDay() !== 0; // Skip Sundays (0 is Sunday)
//       };

//       while (!isWorkingDay(actualEndDate)) {
//         actualEndDate.setDate(actualEndDate.getDate() + 1);
//       }

//       allocation.actualEndDate = actualEndDate;

//       // Determine overall status
//       let overallStatus = "On Track";
//       if (cumulativeProduced < cumulativePlanned) {
//         overallStatus = "Delayed";
//       } else if (cumulativeProduced > cumulativePlanned) {
//         overallStatus = "Ahead";
//       }

//       // Update the last tracking entry's status
//       if (allocation.dailyTracking.length > 0) {
//         allocation.dailyTracking[allocation.dailyTracking.length - 1].dailyStatus = overallStatus;
//       }

//       // Save updated project
//       await project.save();

//       // Recalculate and update part status
//       const status = partItem.calculateStatus();
//       partItem.status = status.text;
//       partItem.statusClass = status.class;
//       await project.save();

//       // Prepare comprehensive response
//       const responseData = {
//         _id: partItem._id,
//         partName: partItem.partName,
//         status: partItem.status,
//         statusClass: partItem.statusClass,
//         allocations: partItem.allocations.map((alloc) => ({
//           _id: alloc._id,
//           processName: alloc.processName,
//           allocations: alloc.allocations.map((a) => ({
//             _id: a._id,
//             plannedQuantity: a.plannedQuantity,
//             startDate: a.startDate,
//             endDate: a.endDate,
//             actualEndDate: a.actualEndDate,
//             dailyTracking: a.dailyTracking,
//             status: overallStatus,
//             dailyPlannedQty: a.dailyPlannedQty, // Explicitly include dailyPlannedQty
//             shiftTotalTime: a.shiftTotalTime,
//             perMachinetotalTime: a.perMachinetotalTime
//           })),
//         })),
//       };

//       res.status(200).json({
//         status: "success",
//         message: "Daily tracking updated successfully",
//         data: responseData,
//         metrics: {
//           cumulativeProduced,
//           cumulativePlanned,
//           remainingQuantity,
//           productionRate,
//           estimatedRemainingDays,
//           dailyPlannedQty // Include in response for verification
//         }
//       });
//     } catch (error) {
//       console.error("Error updating daily tracking:", error);
//       res.status(500).json({
//         status: "error",
//         message: "Failed to update daily tracking",
//         error: error.message,
//       });
//     }
//   }
// );

// partproject.get(
//   "/projects/:projectId/partsLists/:partsListId/partsListItems/:partListItemId/allocations/:processId/allocations/:allocationId/dailyTracking",
//   async (req, res) => {
//     try {
//       const {
//         projectId,
//         partsListId,
//         partListItemId,
//         processId,
//         allocationId,
//       } = req.params;

//       // Find the project
//       const project = await PartListProjectModel.findById(projectId);
//       if (!project) return res.status(404).json({ error: "Project not found" });

//       // Find the part list
//       const partsList = project.partsLists.find(
//         (p) => p._id.toString() === partsListId
//       );
//       if (!partsList)
//         return res.status(404).json({ error: "Parts List not found" });

//       // Find the part list item
//       const partItem = partsList.partsListItems.find(
//         (p) => p._id.toString() === partListItemId
//       );
//       if (!partItem)
//         return res.status(404).json({ error: "Part List Item not found" });

//       // Find the process
//       const process = partItem.allocations.find(
//         (p) => p._id.toString() === processId
//       );
//       if (!process) return res.status(404).json({ error: "Process not found" });

//       // Find the allocation within the process
//       const allocation = process.allocations.find(
//         (a) => a._id.toString() === allocationId
//       );
//       if (!allocation)
//         return res.status(404).json({ error: "Allocation not found" });

//       // Return daily tracking data along with dailyPlannedQty and actualEndDate
//       res.status(200).json({
//         dailyTracking: allocation.dailyTracking,
//         dailyPlannedQty: allocation.dailyPlannedQty,
//         actualEndDate: allocation.actualEndDate,
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Server error" });
//     }
//   }
// );


partproject.post(
  "/projects/:projectId/partsLists/:partsListId/partsListItems/:partsListItemsId/allocation",
  async (req, res) => {
    try {
      const { projectId, partsListId, partsListItemsId } = req.params;
      const { allocations } = req.body;

      if (!Array.isArray(allocations) || allocations.length === 0) {
        return res.status(400).json({ message: "Invalid allocation data" });
      }

      const project = await PartListProjectModel.findOne({ _id: projectId });
      if (!project) return res.status(404).json({ message: "Project not found" });

      const partsList = project.partsLists.find(
        list => list._id.toString() === partsListId
      );
      if (!partsList) return res.status(404).json({ message: "Parts List not found" });

      const partItem = partsList.partsListItems.find(
        item => item._id.toString() === partsListItemsId
      );
      if (!partItem) return res.status(404).json({ message: "Part List Item not found" });

      // Clear existing allocations first
      partItem.allocations = [];

      // Add new allocations with calculated dailyPlannedQty
      allocations.forEach((alloc) => {
        const newAllocation = {
          partName: alloc.partName,
          processName: alloc.processName,
          processId: alloc.processId,
          partsCodeId: alloc.partsCodeId,
          allocations: alloc.allocations.map(a => {
            const dailyPlannedQty = Math.floor(a.shiftTotalTime / a.perMachinetotalTime);
            return {
              ...a,
              dailyPlannedQty,
              dailyTracking: []
            }
          })
        };
        partItem.allocations.push(newAllocation);
      });

      // Calculate and update status
      const status = partItem.calculateStatus();
      partItem.status = status.text;
      partItem.statusClass = status.class;

      await project.save();

      // Return the updated part item with dailyPlannedQty
      const updatedPartItem = partItem.toObject();
      updatedPartItem.allocations = updatedPartItem.allocations.map(alloc => ({
        ...alloc,
        allocations: alloc.allocations.map(a => ({
          ...a,
          dailyPlannedQty: a.dailyPlannedQty
        }))
      }));

      res.status(201).json({
        message: "Allocations added successfully",
        data: updatedPartItem
      });
    } catch (error) {
      console.error("Error adding allocations:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

partproject.delete(
  "/projects/:projectId/partsLists/:partsListId/partsListItems/:partsListItemsId/allocation",
  async (req, res) => {
    try {
      const { projectId, partsListId, partsListItemsId } = req.params;

      // Find the project
      const project = await PartListProjectModel.findOne({ _id: projectId });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Find the correct parts list
      const partsList = project.partsLists.find(
        (list) => list._id.toString() === partsListId
      );

      if (!partsList) {
        return res.status(404).json({ message: "Parts List not found" });
      }

      // Find the correct part inside the parts list
      const partItem = partsList.partsListItems.find(
        (item) => item._id.toString() === partsListItemsId
      );

      if (!partItem) {
        return res.status(404).json({ message: "Part List Item not found" });
      }

      // Clear all allocations
      partItem.allocations = [];

      // Save the updated project
      await project.save();

      res.status(200).json({
        message: "All allocations deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting allocations:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

partproject.get(
  "/projects/:projectId/partsLists/:partsListId/partsListItems/:partsListItemsId/allocation",
  async (req, res) => {
    try {
      const { projectId, partsListId, partsListItemsId } = req.params;

      // Validate IDs
      if (
        !isValidObjectId(projectId) ||
        !isValidObjectId(partsListId) ||
        !isValidObjectId(partsListItemsId)
      ) {
        return res.status(400).json({ message: "Invalid or missing ID(s)" });
      }

      // Find the project
      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Find the parts list
      const partsList = project.partsLists.find(
        (list) => list._id.toString() === partsListId
      );
      if (!partsList) {
        return res.status(404).json({ message: "Parts List not found" });
      }

      // Find the part item
      const partItem = partsList.partsListItems.find(
        (item) => item._id.toString() === partsListItemsId
      );
      if (!partItem) {
        return res.status(404).json({ message: "Part List Item not found" });
      }

      // Send response with daily tracking included
      res.status(200).json({
        message: "Allocations retrieved successfully",
        data: partItem.allocations.map((allocation) => ({
          ...allocation.toObject(),
          dailyTracking: allocation.dailyTracking,
        })),
      });
    } catch (error) {
      console.error("Error retrieving allocations:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

partproject.post(
  "/projects/:projectId/partsLists/:partsListId/partsListItems/:partListItemId/allocations/:processId/allocations/:allocationId/dailyTracking",
  async (req, res) => {
    try {
      const {
        projectId,
        partsListId,
        partListItemId,
        processId,
        allocationId,
      } = req.params;
      const { date, planned, produced, operator, dailyStatus } = req.body;

      // Validate inputs
      if (!date || isNaN(new Date(date))) {
        return res.status(400).json({ 
          status: "error",
          message: "Invalid date provided"
        });
      }

      if (isNaN(planned) || isNaN(produced)) {
        return res.status(400).json({ 
          status: "error",
          message: "Planned and produced quantities must be numbers"
        });
      }

      // Convert to numbers
      const plannedQty = Number(planned);
      const producedQty = Number(produced);

      // Find the project with necessary data populated
      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({ 
          status: "error",
          message: "Project not found"
        });
      }

      // Find the parts list
      const partsList = project.partsLists.id(partsListId);
      if (!partsList) {
        return res.status(404).json({ 
          status: "error",
          message: "Parts list not found"
        });
      }

      // Find the part item
      const partItem = partsList.partsListItems.id(partListItemId);
      if (!partItem) {
        return res.status(404).json({ 
          status: "error",
          message: "Part list item not found"
        });
      }

      // Find the process
      const process = partItem.allocations.id(processId);
      if (!process) {
        return res.status(404).json({ 
          status: "error",
          message: "Process not found"
        });
      }

      // Find the allocation
      const allocation = process.allocations.id(allocationId);
      if (!allocation) {
        return res.status(404).json({ 
          status: "error",
          message: "Allocation not found"
        });
      }

      // Calculate daily planned quantity with safeguards
      const shiftTotalTime = allocation.shiftTotalTime || 510; // Default to 8.5 hours (510 minutes)
      const perMachinetotalTime = allocation.perMachinetotalTime || 1; // Prevent division by zero
      const plannedQuantity = allocation.plannedQuantity || 0;

      // Calculate daily planned quantity
      let dailyPlannedQty = allocation.dailyPlannedQty;
      if (!dailyPlannedQty) {
        const totalTimeRequired = plannedQuantity * perMachinetotalTime;
        dailyPlannedQty = 
          totalTimeRequired <= shiftTotalTime
            ? plannedQuantity
            : Math.floor(shiftTotalTime / perMachinetotalTime);
        
        // Update the allocation with calculated daily planned quantity
        allocation.dailyPlannedQty = dailyPlannedQty;
      }

      // Check if tracking for this date already exists
      const existingTrackingIndex = allocation.dailyTracking.findIndex(
        track => new Date(track.date).toDateString() === new Date(date).toDateString()
      );

      // Determine status based on production
      let calculatedStatus = dailyStatus;
      if (producedQty === plannedQty) {
        calculatedStatus = "On Track";
      } else if (producedQty > plannedQty) {
        calculatedStatus = "Ahead";
      } else {
        calculatedStatus = "Delayed";
      }

      const newTrackingEntry = {
        date: new Date(date),
        planned: plannedQty,
        produced: producedQty,
        operator: operator || allocation.operator || "",
        dailyStatus: calculatedStatus
      };

      if (existingTrackingIndex >= 0) {
        // Update existing entry
        allocation.dailyTracking[existingTrackingIndex] = newTrackingEntry;
      } else {
        // Add new entry
        allocation.dailyTracking.push(newTrackingEntry);
      }

      // Sort tracking by date
      allocation.dailyTracking.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // Calculate cumulative production metrics
      let cumulativeProduced = 0;
      let cumulativePlanned = 0;
      let totalDays = allocation.dailyTracking.length;

      allocation.dailyTracking.forEach(entry => {
        cumulativeProduced += entry.produced || 0;
        cumulativePlanned += entry.planned || 0;
      });

      // Calculate production rate and remaining quantity
      const productionRate = totalDays > 0 ? cumulativeProduced / totalDays : 0;
      const remainingQuantity = Math.max(0, plannedQuantity - cumulativeProduced);
      const estimatedRemainingDays = productionRate > 0 
        ? Math.ceil(remainingQuantity / productionRate) 
        : 0;

      // Calculate actual end date
      const originalEndDate = new Date(allocation.endDate);
      let actualEndDate = new Date(originalEndDate);

      if (cumulativeProduced >= plannedQuantity) {
        // Production completed - use last tracking date
        const lastTrackingDate = new Date(
          allocation.dailyTracking[allocation.dailyTracking.length - 1].date
        );
        actualEndDate = lastTrackingDate;
      } else if (productionRate > 0) {
        // Adjust end date based on production rate
        const today = new Date();
        actualEndDate = new Date(today);
        actualEndDate.setDate(actualEndDate.getDate() + estimatedRemainingDays);
      }

      // Adjust for weekends (skip Sundays)
      while (actualEndDate.getDay() === 0) {
        actualEndDate.setDate(actualEndDate.getDate() + 1);
      }

      allocation.actualEndDate = actualEndDate;

      // Determine overall status based on cumulative production
      let overallStatus = "On Track";
      if (cumulativeProduced < cumulativePlanned) {
        overallStatus = "Delayed";
      } else if (cumulativeProduced > cumulativePlanned) {
        overallStatus = "Ahead";
      }

      // Update the last tracking entry's status
      if (allocation.dailyTracking.length > 0) {
        allocation.dailyTracking[allocation.dailyTracking.length - 1].dailyStatus = overallStatus;
      }

      // Save updated project
      await project.save();

      // Recalculate and update part status
      const status = partItem.calculateStatus();
      partItem.status = status.text;
      partItem.statusClass = status.class;
      await project.save();

      // Prepare response data
      const responseData = {
        _id: partItem._id,
        partName: partItem.partName,
        status: partItem.status,
        statusClass: partItem.statusClass,
        allocations: partItem.allocations.map(alloc => ({
          _id: alloc._id,
          processName: alloc.processName,
          allocations: alloc.allocations.map(a => ({
            _id: a._id,
            plannedQuantity: a.plannedQuantity,
            startDate: a.startDate,
            endDate: a.endDate,
            actualEndDate: a.actualEndDate,
            dailyTracking: a.dailyTracking,
            status: a._id.toString() === allocationId ? overallStatus : a.status,
            dailyPlannedQty: a.dailyPlannedQty,
            shiftTotalTime: a.shiftTotalTime,
            perMachinetotalTime: a.perMachinetotalTime
          }))
        })),
        metrics: {
          cumulativeProduced,
          cumulativePlanned,
          remainingQuantity,
          productionRate: parseFloat(productionRate.toFixed(2)),
          estimatedRemainingDays,
          dailyPlannedQty
        }
      };

      res.status(200).json({
        status: "success",
        message: "Daily tracking updated successfully",
        data: responseData
      });

    } catch (error) {
      console.error("Error updating daily tracking:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to update daily tracking",
        error: error.message,
      });
    }
  }
);

partproject.get(
  "/projects/:projectId/partsLists/:partsListId/partsListItems/:partListItemId/allocations/:processId/allocations/:allocationId/dailyTracking",
  async (req, res) => {
    try {
      const {
        projectId,
        partsListId,
        partListItemId,
        processId,
        allocationId,
      } = req.params;

      // Find the project
      const project = await PartListProjectModel.findById(projectId);
      if (!project) return res.status(404).json({ error: "Project not found" });

      // Find the part list
      const partsList = project.partsLists.find(
        (p) => p._id.toString() === partsListId
      );
      if (!partsList)
        return res.status(404).json({ error: "Parts List not found" });

      // Find the part list item
      const partItem = partsList.partsListItems.find(
        (p) => p._id.toString() === partListItemId
      );
      if (!partItem)
        return res.status(404).json({ error: "Part List Item not found" });

      // Find the process
      const process = partItem.allocations.find(
        (p) => p._id.toString() === processId
      );
      if (!process) return res.status(404).json({ error: "Process not found" });

      // Find the allocation within the process
      const allocation = process.allocations.find(
        (a) => a._id.toString() === allocationId
      );
      if (!allocation)
        return res.status(404).json({ error: "Allocation not found" });

      // Return daily tracking data along with dailyPlannedQty and actualEndDate
      res.status(200).json({
        dailyTracking: allocation.dailyTracking,
        dailyPlannedQty: allocation.dailyPlannedQty,
        actualEndDate: allocation.actualEndDate,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);