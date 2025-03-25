"use client";

import { Search } from "lucide-react";
import { Input } from "@heroui/input";
import { useDebounceValue } from "usehooks-ts";
import { ChangeEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchInput = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [debouncedValue] = useDebounceValue(value, 500);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  useEffect(() => {
    navigate(debouncedValue ? "/rooms?search=" + debouncedValue : "/rooms");
  }, [debouncedValue, navigate]);

  return (
    <Input
      className={"w-full max-w-md"}
      placeholder="Search Rooms"
      size={"md"}
      startContent={
        <Search className="size-4 text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="string"
      variant="bordered"
      onChange={handleChange}
    />
  );
};

export default SearchInput;
