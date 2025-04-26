"use client";

import {memo, useEffect, useState} from "react";

import { RoomEditModal } from "@/components/modal/room-edit-modal.tsx";
import {RoomCreationModal} from "@/components/modal/room-creation-modal.tsx";

export const ModalProvider = memo(() => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <RoomEditModal />
      <RoomCreationModal />
    </>
  );
});

ModalProvider.displayName = "ModalProvider";
