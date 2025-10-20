"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmEmail } from "@/lib/auth";
import ConfirmEmailClient from "@/components/auth/ConfirmEmailClient";

export default function ConfirmEmailPage() {
  return <ConfirmEmailClient />;
}
