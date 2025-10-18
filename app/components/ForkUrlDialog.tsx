"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface ForkUrlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentForkUrl: string;
  onForkUrlChange: (url: string) => void;
  onGoto: () => void;
}

export default function ForkUrlDialog({
  open,
  onOpenChange,
  currentForkUrl,
  onForkUrlChange,
  onGoto,
}: ForkUrlDialogProps) {
  const [username, setUsername] = useState("");
  const [repository, setRepository] = useState("");

  // Parse the current fork URL to extract username and repository
  useEffect(() => {
    if (currentForkUrl) {
      const url = currentForkUrl.replace(/^https?:\/\/github\.com\//, "");
      const parts = url.split("/");
      if (parts.length >= 2) {
        setUsername(parts[0]);
        setRepository(parts[1]);
      }
    }
  }, [currentForkUrl]);

  const handleCancel = () => {
    // Reset to current values
    const url = currentForkUrl.replace(/^https?:\/\/github\.com\//, "");
    const parts = url.split("/");
    if (parts.length >= 2) {
      setUsername(parts[0]);
      setRepository(parts[1]);
    }
    onOpenChange(false);
  };

  const handleGoto = () => {
    const fullUrl = `https://github.com/${username}/${repository}`;
    onForkUrlChange(fullUrl);
    onGoto();
    onOpenChange(false);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleRepositoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepository(e.target.value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Fork URL</DialogTitle>
          <DialogDescription>
            Enter the GitHub fork URL for the CCF deadlines repository.
            {/* You need to make changes in the forked repository and then create a pull
            request to the original CCF deadlines repository. */}
            If you haven&apos;t forked the CCF deadlines yet, go to
            <Link
              href="https://www.github.com/ccfddl/ccf-deadlines"
              className="text-blue-500"
            >
              {" "}
              ccfddl/ccf-deadlines{" "}
            </Link>
            to fork it first.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={handleUsernameChange}
              placeholder="username"
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="repository">Repository</Label>
            <Input
              id="repository"
              value={repository}
              onChange={handleRepositoryChange}
              placeholder="repository"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleGoto}>Goto</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
