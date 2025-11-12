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
  const [searchTerm, setSearchTerm] = useState("");

  // Debounced search to avoid excessive API calls
  const debouncedSearch = useCallback(
    debounce((inputValue) => {
      onSearch(inputValue);
    }, 400),
    [onSearch]
  );

  const handleInputChange = (inputValue) => {
    setSearchTerm(inputValue);
    debouncedSearch(inputValue);
    return inputValue;
  };

  // convert your parts into react-select format if not already formatted
  const formattedOptions = options.map((part) => ({
    value: part._id,
    label: `${part.partName} (${part.id}) - ${part.partType}`,
  }));

  // find selected value
  const selectedOption = formattedOptions.find((opt) => opt.value === value);

  return (
    <Select
      options={formattedOptions}
      value={selectedOption || null}
      onChange={(selected) => {
        onChange(selected ? selected.value : "");
      }}
      placeholder={placeholder}
      isLoading={loading}
      isClearable
      onInputChange={handleInputChange}
      onMenuScrollToBottom={() => {
        if (hasMore && !loading) {
          onLoadMore();
        }
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
    />
  );
};

export default InfiniteScrollSelect;
