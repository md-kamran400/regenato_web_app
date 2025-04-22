import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Collapse,
  Table,
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { BsFillClockFill } from "react-icons/bs";
import { MdOutlineDelete } from "react-icons/md";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import axios from "axios";
import { ImPriceTag } from "react-icons/im";
import { MdInventory } from "react-icons/md";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isSameDay, parseISO, getDay, isSameMonth } from "date-fns";

import { AllocatedAssembly_subAssembly } from "./AllocatedAssembly_subAssembly";

export const Fetch = ({
  partName,
  partId,
  manufacturingVariables,
  quantity,
  porjectID,
  AssemblyListId,
  subAssembliesId,
  partListItemId,
  partManufacturingVariables,
  partsCodeId,
}) => {
    const [activeTab, setActiveTab] = useState("actual");
    
  useEffect(() => {
    const fetchAllocatedData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/assemblyList/${AssemblyListId}/subAssemblies/${subAssembliesId}/partsListItems/${partListItemId}/allocations`
        );

        console.log(response);
      } catch (error) {
        console.error("Error fetching allocated data:", error);
      }
    };

    fetchAllocatedData();
  }, [porjectID, AssemblyListId, subAssembliesId, partListItemId]);

  return (
    <React.Fragment>
    
    </React.Fragment>
  );
};
