// import Select from "react-select";
// import debounce from "lodash.debounce";
// import React, { useState, useCallback, useEffect } from "react";

// const InfiniteScrollSelect = ({
//   options,
//   value,
//   onChange,
//   onSearch,
//   onLoadMore,
//   hasMore,
//   loading,
//   placeholder = "Search and select...",
// }) => {
//   const [searchTerm, setSearchTerm] = useState("");

//   // Debounced search to avoid excessive API calls
//   const debouncedSearch = useCallback(
//     debounce((inputValue) => {
//       onSearch(inputValue);
//     }, 400),
//     [onSearch]
//   );

//   const handleInputChange = (inputValue) => {
//     setSearchTerm(inputValue);
//     debouncedSearch(inputValue);
//     return inputValue;
//   };

//   // convert your parts into react-select format if not already formatted
//   const formattedOptions = options.map((part) => ({
//     value: part._id,
//     label: `${part.partName} (${part.id}) - ${part.partType}`,
//   }));

//   // find selected value
//   const selectedOption = formattedOptions.find((opt) => opt.value === value);

//   return (
//     <Select
//       options={formattedOptions}
//       value={selectedOption || null}
//       onChange={(selected) => {
//         onChange(selected ? selected.value : "");
//       }}
//       placeholder={placeholder}
//       isLoading={loading}
//       isClearable
//       onInputChange={handleInputChange}
//       onMenuScrollToBottom={() => {
//         if (hasMore && !loading) {
//           onLoadMore();
//         }
//       }}
//       styles={{
//         control: (provided) => ({
//           ...provided,
//           minHeight: "40px",
//           height: "40px",
//         }),
//         dropdownIndicator: (provided) => ({
//           ...provided,
//           padding: "4px",
//         }),
//       }}
//     />
//   );
// };

// export default InfiniteScrollSelect;


// import Select from "react-select";
// import debounce from "lodash.debounce";
// import React, { useState, useCallback, useEffect } from "react";

// const InfiniteScrollSelect = ({
//   options,
//   value,
//   onChange,
//   onSearch,
//   onLoadMore,
//   hasMore,
//   loading,
//   placeholder = "Search and select...",
// }) => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [inputValue, setInputValue] = useState("");
//   const [localValue, setLocalValue] = useState(null);

//   // Convert your parts into react-select format
//   const formattedOptions = options.map((part) => ({
//     value: part._id,
//     label: `${part.partName} (${part.id}) - ${part.partType}`,
//     original: part
//   }));

//   // Find selected value
//   const selectedOption = formattedOptions.find((opt) => opt.value === value);

//   // Sync local value with prop value
//   useEffect(() => {
//     setLocalValue(selectedOption || null);
//   }, [selectedOption]);

//   // Debounced search
//   const debouncedSearch = useCallback(
//     debounce((inputValue) => {
//       onSearch(inputValue);
//     }, 400),
//     [onSearch]
//   );

//   const handleInputChange = (inputValue) => {
//     debouncedSearch(inputValue);
//     return inputValue;
//   };

//   const handleChange = (selected) => {
//     setLocalValue(selected);
//     onChange(selected ? selected.value : "");
//   };

//   return (
//     <Select
//       options={formattedOptions}
//       value={localValue}
//       onChange={handleChange}
//       onInputChange={handleInputChange}
//       placeholder={placeholder}
//       isLoading={loading}
//       isClearable
//       onMenuScrollToBottom={() => {
//         if (hasMore && !loading) {
//           onLoadMore();
//         }
//       }}
//       styles={{
//         control: (provided) => ({
//           ...provided,
//           minHeight: "40px",
//           height: "40px",
//         }),
//         dropdownIndicator: (provided) => ({
//           ...provided,
//           padding: "4px",
//         }),
//         singleValue: (provided) => ({
//           ...provided,
//           color: "#000",
//           fontWeight: "500",
//         }),
//       }}
//       closeMenuOnSelect={true}
//     />
//   );
// };

// export default InfiniteScrollSelect;




import Select from "react-select";
import debounce from "lodash.debounce";
import React, { useState, useCallback, useEffect } from "react";

const InfiniteScrollSelect = ({
  options,
  value,
  onChange,
  onSearch,
  onLoadMore,
  hasMore,
  loading,
  placeholder = "Search and select...",
}) => {
  const [inputValue, setInputValue] = useState("");
  const [localOptions, setLocalOptions] = useState([]);

  useEffect(() => {
    if (options && options.length > 0) {
      const formattedOptions = options.map((part) => ({
        value: part._id,
        label: `${part.partName} (${part.id}) - ${part.partType}`,
        original: part,
      }));
      setLocalOptions(formattedOptions);
    }
  }, [options]);

  const debouncedSearch = useCallback(
    debounce((inputValue) => {
      onSearch(inputValue);
    }, 400),
    [onSearch]
  );

  const handleInputChange = (newValue, { action }) => {
    if (action === "input-change") {
      setInputValue(newValue);
      debouncedSearch(newValue);
    } else if (action === "menu-close") {
      // Optional: clear input when dropdown closes
      setInputValue("");
    }
    return newValue;
  };

  const handleChange = (selected) => {
    onChange(selected ? selected.value : "");
    // ✅ Reset input after selection to make the label visible
    setInputValue("");
  };

  const selectedOption = localOptions.find((opt) => opt.value === value) || null;

  return (
    <Select
      options={localOptions}
      value={selectedOption}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      placeholder={placeholder}
      isLoading={loading}
      isClearable
      onMenuScrollToBottom={() => {
        if (hasMore && !loading) onLoadMore();
      }}
      styles={{
        control: (provided) => ({
          ...provided,
          minHeight: "40px",
          height: "40px",
        }),
        dropdownIndicator: (provided) => ({
          ...provided,
          padding: "4px",
        }),
      }}
      blurInputOnSelect={false}
      closeMenuOnSelect={true}
      captureMenuScroll={true}
    />
  );
};

export default InfiniteScrollSelect;
