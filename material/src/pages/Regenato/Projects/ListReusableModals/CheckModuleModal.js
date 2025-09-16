import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Input,
  Badge,
  Progress,
} from "reactstrap";
import { toast } from "react-toastify";

const CheckModuleModal = ({ isOpen, toggle, onSuccess,existingProjects }) => {
  const [products, setProducts] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [fetchProgress, setFetchProgress] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [selectedMissing, setSelectedMissing] = useState(new Set());
  const [selectedAvailable, setSelectedAvailable] = useState(new Set());
  const [isCreatingPOs, setIsCreatingPOs] = useState(false);
  // const [projects, setProjects] = useState([]);

  const fetchDataOptimized = useCallback(async () => {
    if (!isOpen || isInitialized) return;

    setLoading(true);
    setError("");
    setFetchProgress(0);

    try {
      // Step 1: Fetch Production/Product data
      setFetchProgress(15);
      const prodRes = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/Production/Product`
      );
      if (!prodRes.ok) throw new Error("Failed to fetch Production/Product");
      const prodData = await prodRes.json();
      setProducts(Array.isArray(prodData) ? prodData : []);
      setFetchProgress(30);

      // Step 2: Fetch parts data in chunks
      setFetchProgress(40);
      const allParts = [];
      let page = 1;
      const pageSize = 100;
      let hasMore = true;

      while (hasMore) {
        const partsRes = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/parts?page=${page}&limit=${pageSize}`
        );

        if (!partsRes.ok) throw new Error("Failed to fetch parts");
        const partsData = await partsRes.json();

        const partsArray = Array.isArray(partsData.data) ? partsData.data : [];
        if (partsArray.length === 0) {
          hasMore = false;
        } else {
          allParts.push(...partsArray);
          page++;
          // progress tick without hard cap
          setFetchProgress((prev) => Math.min(65, prev + 0.5));
        }
      }
      setParts(allParts);
      setFetchProgress(65);

      // Step 3: Finalize
      setFetchProgress(90);

      setIsInitialized(true);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
      setTimeout(() => setFetchProgress(0), 800);
    }
  }, [isOpen, isInitialized]);

  useEffect(() => {
    fetchDataOptimized();
  }, [fetchDataOptimized]);

  useEffect(() => {
    if (!isOpen) {
      setIsInitialized(false);
      setParts([]);
      setProducts([]);
      setSelectedMissing(new Set());
      setSelectedAvailable(new Set());
    }
  }, [isOpen]);

  // Build sets for quick lookup
  const partsIdSet = useMemo(() => {
    const set = new Set();
    for (const p of parts) {
      if (p && p.id) set.add(String(p.id).trim().toLowerCase());
    }
    return set;
  }, [parts]);

  // Existing project names (PO numbers) passed from parent
  const existingProjectNameSet = useMemo(() => {
    const set = new Set();
    for (const p of existingProjects || []) {
      const name = String(p.projectName || "").trim().toLowerCase();
      if (name) set.add(name);
    }
    return set;
  }, [existingProjects]);

  // Query intent: numeric => DocNum (left), otherwise => ItemCode (right)
  const queryFlags = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    const isDocQuery = q.length >= 2 && /^\d+$/.test(q);
    const isItemCodeQuery = q.length >= 2 && !isDocQuery;
    return { q, isDocQuery, isItemCodeQuery };
  }, [query]);

  // Right: Not available parts by ItemCode only
  const missing = useMemo(() => {
    const { q, isDocQuery, isItemCodeQuery } = queryFlags;
    const source = isDocQuery
      ? products
      : isItemCodeQuery
      ? products.filter((prod) =>
          String(prod.ItemCode || "").toLowerCase().includes(q)
        )
      : products;

    const list = [];
    for (const prod of source) {
      const code = String(prod.ItemCode || "").trim().toLowerCase();
      if (!code) continue;
      if (!partsIdSet.has(code)) list.push(prod);
    }
    return list;
  }, [products, partsIdSet, queryFlags]);

  // Left: Not available PO (can create) -> ItemCode exists in parts AND DocNum not in existing projects
  const available = useMemo(() => {
    const { q, isDocQuery, isItemCodeQuery } = queryFlags;
    const source = isItemCodeQuery
      ? products
      : isDocQuery
      ? products.filter((prod) => String(prod.DocNum ?? "").toLowerCase() === q)
      : products;

    const list = [];
    for (const prod of source) {
      const code = String(prod.ItemCode || "").trim().toLowerCase();
      const doc = String(prod.DocNum || "").trim().toLowerCase();
      if (!code || !doc) continue;
      if (partsIdSet.has(code) && !existingProjectNameSet.has(doc)) list.push(prod);
    }
    return list;
  }, [products, partsIdSet, existingProjectNameSet, queryFlags]);

  const currentMissingCodes = useMemo(
    () =>
      missing.map((p) =>
        String(p.ItemCode || "")
          .trim()
          .toLowerCase()
      ),
    [missing]
  );
  const allCurrentSelectedMissing = useMemo(
    () =>
      currentMissingCodes.length > 0 &&
      currentMissingCodes.every((c) => selectedMissing.has(c)),
    [currentMissingCodes, selectedMissing]
  );

  const toggleSelectMissing = (code) => {
    const normalized = String(code || "")
      .trim()
      .toLowerCase();
    setSelectedMissing((prev) => {
      const next = new Set(prev);
      if (next.has(normalized)) next.delete(normalized);
      else next.add(normalized);
      return next;
    });
  };

  const toggleSelectAllMissing = () => {
    setSelectedMissing((prev) => {
      const next = new Set(prev);
      const allSelected = currentMissingCodes.every((c) => next.has(c));
      if (allSelected) {
        for (const c of currentMissingCodes) next.delete(c);
      } else {
        for (const c of currentMissingCodes) next.add(c);
      }
      return next;
    });
  };

  const currentAvailableCodes = useMemo(
    () =>
      available.map((p) =>
        String(p.DocNum || "")
          .trim()
          .toLowerCase()
      ),
    [available]
  );
  const allCurrentSelectedAvailable = useMemo(
    () =>
      currentAvailableCodes.length > 0 &&
      currentAvailableCodes.every((c) => selectedAvailable.has(c)),
    [currentAvailableCodes, selectedAvailable]
  );

  const toggleSelectAvailable = (docNum) => {
    const normalized = String(docNum || "")
      .trim()
      .toLowerCase();
    setSelectedAvailable((prev) => {
      const next = new Set(prev);
      if (next.has(normalized)) next.delete(normalized);
      else next.add(normalized);
      return next;
    });
  };

  const toggleSelectAllAvailable = () => {
    setSelectedAvailable((prev) => {
      const next = new Set(prev);
      const allSelected = currentAvailableCodes.every((c) => next.has(c));
      if (allSelected) {
        for (const c of currentAvailableCodes) next.delete(c);
      } else {
        for (const c of currentAvailableCodes) next.add(c);
      }
      return next;
    });
  };

  const handleAddSelectedParts = async () => {
    if (selectedMissing.size === 0 || isBulkAdding) return;
    setIsBulkAdding(true);

    try {
      const selectedProducts = products.filter((prod) => {
        const code = String(prod.ItemCode || "")
          .trim()
          .toLowerCase();
        return selectedMissing.has(code) && !partsIdSet.has(code);
      });

      if (selectedProducts.length === 0) {
        toast.info("No new parts to add.");
        setIsBulkAdding(false);
        return;
      }

      const requests = selectedProducts.map((prod) => {
        const payload = {
          id: prod.ItemCode || "",
          partName: prod.ProdName || "",
          clientNumber: "",
          codeName: "",
          partType: "Make",
          costPerUnit: 0,
          timePerUnit: 0,
          stockPOQty: 0,
          totalCost: 0,
          totalQuantity: 0,
        };
        return fetch(`${process.env.REACT_APP_BASE_URL}/api/parts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      });

      const results = await Promise.allSettled(requests);
      let successCount = 0;
      let duplicateCount = 0;
      let otherErrors = 0;

      const createdParts = [];
      for (let i = 0; i < results.length; i++) {
        const res = results[i];
        if (res.status === "fulfilled" && res.value.ok) {
          successCount++;
          try {
            const part = await res.value.json();
            createdParts.push(part);
          } catch (_) {}
        } else if (res.status === "fulfilled" && !res.value.ok) {
          try {
            const err = await res.value.json();
            if (err.message && err.message.includes("duplicate key error"))
              duplicateCount++;
            else otherErrors++;
          } catch (_) {
            otherErrors++;
          }
        } else {
          otherErrors++;
        }
      }

      if (successCount > 0) {
        // Update local parts state
        setParts((prev) => [...prev, ...createdParts]);

        // Clear selections for successfully added parts
        setSelectedMissing((prev) => {
          const next = new Set(prev);
          for (const p of createdParts) {
            const code = String(p.id || "")
              .trim()
              .toLowerCase();
            next.delete(code);
          }
          return next;
        });
      }

      if (successCount) toast.success(`Added ${successCount} part(s).`);
      if (duplicateCount) toast.info(`${duplicateCount} duplicate(s) skipped.`);
      if (otherErrors) toast.error(`${otherErrors} failed.`);

      // Auto-refresh data to update availability
      setTimeout(() => {
        setIsInitialized(false);
        fetchDataOptimized();
      }, 1000);
    } catch (error) {
      toast.error(`Bulk add failed: ${error.message}`);
    } finally {
      setIsBulkAdding(false);
    }
  };


  const handleAddSelectedPOs = async () => {
  if (selectedAvailable.size === 0 || isCreatingPOs) return;
  setIsCreatingPOs(true);
  try {
    // ✅ Build set of existing PO names
    const existingNames = new Set(
      (existingProjects || []).map((p) =>
        String(p.projectName || "").trim().toLowerCase()
      )
    );

    const idToPart = new Map(
      parts.map((p) => [
        String(p.id || "")
          .trim()
          .toLowerCase(),
        p,
      ])
    );

    // ✅ Filter out already existing POs
    const selectedProducts = available.filter((prod) => {
      const poName = String(prod.DocNum || "").trim().toLowerCase();
      return selectedAvailable.has(poName) && !existingNames.has(poName);
    });

    if (selectedProducts.length === 0) {
      toast.error("Selected PO(s) already exist!");
      setIsCreatingPOs(false);
      return;
    }

    const requests = selectedProducts.map((prod) => {
      const code = String(prod.ItemCode || "").trim().toLowerCase();
      const matchedPart = idToPart.get(code);
      if (!matchedPart || !matchedPart._id) {
        return Promise.resolve({ ok: false, _skipped: true });
      }
      const payload = {
        projectName: String(prod.DocNum || ""),
        projectType: "External PO",
        // Use ItemCode (our external part id) instead of Mongo _id
        selectedPartId: matchedPart.id,
        selectedPartName: prod.ProdName || matchedPart.partName || "",
        partQuantity: prod.PlannedQty || 0,
      };
      return fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/production_part`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
    });

    const results = await Promise.allSettled(requests);
    let successCount = 0;
    let skipped = 0;
    let failed = 0;

    for (const r of results) {
      if (r.status === "fulfilled") {
        if (r.value._skipped) skipped++;
        else if (r.value.ok) successCount++;
        else failed++;
      } else failed++;
    }

    if (successCount) {
      toast.success(`Created ${successCount} project(s).`);

      // 🔑 fetch newly created projects and pass them to parent
      try {
        const newRes = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects`
        );
        if (newRes.ok) {
          const allProjects = await newRes.json();
          const justCreated = allProjects
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, successCount);

          if (onSuccess) onSuccess(justCreated);
        }
      } catch (err) {
        console.error("Failed to fetch new projects:", err);
      }
    }

    if (skipped) toast.info(`${skipped} item(s) skipped (no matching part).`);
    if (failed) toast.error(`${failed} creation(s) failed.`);

    // Clear selections
    setSelectedAvailable(new Set());

    // Refresh modal data internally
    setTimeout(() => {
      setIsInitialized(false);
      fetchDataOptimized();
    }, 1000);
  } catch (err) {
    toast.error(`Add PO failed: ${err.message}`);
  } finally {
    setIsCreatingPOs(false);
  }
};

  const handleRefresh = () => {
    setIsInitialized(false);
    setSelectedMissing(new Set());
    setSelectedAvailable(new Set());
    fetchDataOptimized();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" centered>
      <ModalHeader toggle={toggle}>
        Sync Production Orders
        {isInitialized && (
          <Button
            color="outline-primary"
            size="sm"
            className="ms-2"
            onClick={handleRefresh}
          >
            <i className="ri-refresh-line"></i> Refresh
          </Button>
        )}
      </ModalHeader>
      <ModalBody>
        {loading && (
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>Loading data...</span>
              <span>{fetchProgress.toFixed(0)}%</span>
            </div>
            <Progress value={fetchProgress} color="primary" />
          </div>
        )}

        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <div className="flex-grow-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, item code or Doc No... (min 2 characters)"
              disabled={loading}
            />
          </div>
          <div className="d-flex align-items-center gap-2">
            <Badge color="success" pill>
              Not Available PO: {available.length}
            </Badge>
            <Badge color="danger" pill>
              Not Available Parts: {missing.length}
            </Badge>
            <Badge color="info" pill>
              Total: {available.length + missing.length}
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center my-4">
            <div className="text-center">
              <Spinner color="primary" />
              <p className="mt-2">Fetching data... Please wait</p>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger">
            {error}
            <Button
              color="outline-danger"
              size="sm"
              className="ms-2"
              onClick={handleRefresh}
            >
              Retry
            </Button>
          </div>
        ) : (
          <div
            className="row g-3"
            style={{ height: "60vh", overflow: "hidden" }}
          >
            <div className="col-12 col-lg-6">
              <div className="card h-100" style={{ height: "100%" }}>
                <div className="card-header bg-success-subtle d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <strong>Not Available PO (createable)</strong>
                    <Badge color="success">{available.length}</Badge>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div className="form-check m-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="selectAllAvailable"
                        checked={allCurrentSelectedAvailable}
                        onChange={toggleSelectAllAvailable}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="selectAllAvailable"
                      >
                        Select All
                      </label>
                    </div>
                    <Button
                      color="primary"
                      size="sm"
                      disabled={selectedAvailable.size === 0 || isCreatingPOs}
                      onClick={handleAddSelectedPOs}
                    >
                      {isCreatingPOs ? (
                        <>
                          <Spinner
                            className="me-1"
                            style={{
                              width: "1rem",
                              height: "1rem",
                              borderWidth: "0.15em",
                            }}
                          />{" "}
                          Adding PO...
                        </>
                      ) : (
                        <>Add PO ({selectedAvailable.size})</>
                      )}
                    </Button>
                  </div>
                </div>
                <div
                  className="card-body p-0"
                  style={{ overflowY: "auto", maxHeight: "58vh" }}
                >
                  {available.length === 0 ? (
                    <div className="p-3 text-muted">No matches found.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm table-hover mb-0">
                        {/* <thead className="table-light">
                          <tr>
                            <th style={{ width: "36px" }}>
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={allCurrentSelectedAvailable}
                                onChange={toggleSelectAllAvailable}
                              />
                            </th>
                            <th>Name</th>
                          </tr>
                        </thead> */}
                        <tbody>
                          {available.map((prod, idx) => {
                            const key = String(prod.DocNum || "")
                              .trim()
                              .toLowerCase();
                            const checked = selectedAvailable.has(key);
                            return (
                              <tr key={`a-${idx}`}>
                                <td>
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleSelectAvailable(key)}
                                  />
                                </td>
                                <td className="fw-semibold">
                                  {`${prod.ProdName || ""} - ${prod.DocNum || ""}`}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="card h-100" style={{ height: "100%" }}>
                <div className="card-header bg-danger-subtle d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <strong>Not Available Parts</strong>
                    <Badge color="danger">{missing.length}</Badge>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <Button
                      color="success"
                      size="sm"
                      disabled={selectedMissing.size === 0 || isBulkAdding}
                      onClick={handleAddSelectedParts}
                    >
                      {isBulkAdding ? (
                        <>
                          <Spinner size="sm" className="me-1" /> Adding...
                        </>
                      ) : (
                        <>Add Parts ({selectedMissing.size})</>
                      )}
                    </Button>
                    <div className="form-check m-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="selectAllMissing"
                        checked={allCurrentSelectedMissing}
                        onChange={toggleSelectAllMissing}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="selectAllMissing"
                      >
                        Select All
                      </label>
                    </div>
                  </div>
                </div>
                <div
                  className="card-body p-0"
                  style={{ overflowY: "auto", maxHeight: "58vh" }}
                >
                  {missing.length === 0 ? (
                    <div className="p-3 text-muted">
                      All items are available!
                    </div>
                  ) : (
                    <ul className="list-group list-group-flush">
                      {missing.map((prod, idx) => {
                        const code = String(prod.ItemCode || "")
                          .trim()
                          .toLowerCase();
                        const checked = selectedMissing.has(code);
                        return (
                          <li
                            key={`m-${idx}`}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            <div className="d-flex align-items-center gap-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleSelectMissing(code)}
                              />
                              <span>{`${prod.ProdName || ""} - ${String(prod.ItemCode || "")}`}</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CheckModuleModal;
