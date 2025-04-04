import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table,
  Badge,
} from "reactstrap";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "react-toastify";

const MachineDowntimeHistory = ({ isOpen, toggle, machine, parentId }) => {
  const [downtimeHistory, setDowntimeHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && machine && parentId) {
      fetchDowntimeHistory();
    }
  }, [isOpen, machine, parentId]);

  const fetchDowntimeHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/manufacturing/${parentId}/machines/${machine._id}/downtime`
      );

      if (response.status === 200) {
        setDowntimeHistory(response.data.downtimeHistory || []);
      }
    } catch (error) {
      console.error("Error fetching downtime history:", error);
      toast.error("Failed to load downtime history");
    } finally {
      setLoading(false);
    }
  };

  const handleEndDowntime = async (downtimeId) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/manufacturing/${parentId}/machines/${machine._id}/downtime/${downtimeId}/end`,
        { endTime: new Date().toISOString() }
      );

      if (response.status === 200) {
        toast.success("Machine downtime ended successfully");
        fetchDowntimeHistory();
      }
    } catch (error) {
      console.error("Error ending downtime:", error);
      toast.error("Failed to end downtime");
    }
  };

  const getStatusBadge = (downtime) => {
    const now = new Date();
    const startTime = new Date(downtime.startTime);
    const endTime = downtime.endTime ? new Date(downtime.endTime) : null;

    if (endTime && endTime < now) {
      return <Badge color="secondary">Completed</Badge>;
    } else if (startTime <= now && (!endTime || endTime > now)) {
      return <Badge color="danger">Active</Badge>;
    } else if (startTime > now) {
      return <Badge color="warning">Scheduled</Badge>;
    }

    return <Badge color="secondary">Unknown</Badge>;
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        Downtime History for {machine?.name || "Machine"}
      </ModalHeader>
      <ModalBody>
        {loading ? (
          <div className="text-center">Loading downtime history...</div>
        ) : downtimeHistory.length === 0 ? (
          <div className="text-center">
            No downtime records found for this machine.
          </div>
        ) : (
          <Table bordered responsive>
            <thead>
              <tr>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {downtimeHistory.map((downtime, index) => (
                <tr key={index}>
                  <td>
                    {format(new Date(downtime.startTime), "dd/MM/yyyy HH:mm")}
                  </td>
                  <td>
                    {downtime.endTime
                      ? format(new Date(downtime.endTime), "dd/MM/yyyy HH:mm")
                      : "Not ended yet"}
                  </td>
                  <td>{downtime.reason}</td>
                  <td>{getStatusBadge(downtime)}</td>
                  {/* <td>
                    {!downtime.endTime &&
                      new Date(downtime.startTime) <= new Date() && (
                        <Button
                          color="success"
                          size="sm"
                          onClick={() => handleEndDowntime(downtime._id)}
                        >
                          End Downtime
                        </Button>
                      )}
                  </td> */}
                </tr>
              ))}
            </tbody>
          </Table>
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

export default MachineDowntimeHistory;