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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useSettings, AppSettings } from "@/app/lib/settings";
import { Settings, Github, Bell, RotateCcw } from "lucide-react";
import Link from "next/link";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsDialog({
  open,
  onOpenChange,
}: SettingsDialogProps) {
  const settingsHook = useSettings();
  const { settings, isLoaded, resetSettings } = settingsHook;
  const updateSettings = settingsHook.updateSettings;

  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  // Parse GitHub repository into username and repository parts
  const parseGitHubRepository = (repo: string) => {
    const parts = repo.split("/");
    return {
      username: parts[0] || "",
      repository: parts[1] || "",
    };
  };

  const { username: currentUsername, repository: currentRepository } =
    parseGitHubRepository(localSettings.githubCcfDeadlinesRepoFork);

  // Update local settings when dialog opens or settings change
  useEffect(() => {
    if (open && isLoaded) {
      setLocalSettings(settings);
      setHasChanges(false);
    }
  }, [open, settings, isLoaded]);

  // Check for changes
  useEffect(() => {
    const changed = Object.keys(localSettings).some(
      (key) =>
        localSettings[key as keyof AppSettings] !==
        settings[key as keyof AppSettings]
    );
    setHasChanges(changed);
  }, [localSettings, settings]);

  const handleSave = () => {
    updateSettings(localSettings);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    setHasChanges(false);
    onOpenChange(false);
  };

  const handleReset = () => {
    if (
      confirm(
        "Are you sure you want to reset all settings to their default values?"
      )
    ) {
      resetSettings();
      onOpenChange(false);
    }
  };

  const handleGitHubUsernameChange = (username: string) => {
    const repository = parseGitHubRepository(
      localSettings.githubCcfDeadlinesRepoFork
    ).repository;
    const newRepository = `${username}/${repository}`;
    setLocalSettings((prev) => ({
      ...prev,
      githubCcfDeadlinesRepoFork: newRepository,
    }));
  };

  const handleGitHubRepositoryNameChange = (repository: string) => {
    const username = parseGitHubRepository(
      localSettings.githubCcfDeadlinesRepoFork
    ).username;
    const newRepository = `${username}/${repository}`;
    setLocalSettings((prev) => ({
      ...prev,
      githubCcfDeadlinesRepoFork: newRepository,
    }));
  };

  const handleNotificationsChange = (enabled: boolean) => {
    setLocalSettings((prev) => ({ ...prev, notificationsEnabled: enabled }));
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Application Settings
          </DialogTitle>
          <DialogDescription>
            Configure your application preferences and behavior.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* GitHub Repository Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              <h3 className="text-sm font-medium">GitHub Repository</h3>
            </div>
            <div className="space-y-3 ml-4">
              <div className="grid gap-3">
                <Label>Repository Path to the Forked ccf-deadlines</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      id="github-username"
                      value={currentUsername}
                      onChange={(e) =>
                        handleGitHubUsernameChange(e.target.value)
                      }
                      placeholder="username"
                      className="font-mono text-sm max-w-[120px]"
                    />
                    <span className="text-muted-foreground font-mono">/</span>
                    <Input
                      id="github-repository"
                      value={currentRepository}
                      onChange={(e) =>
                        handleGitHubRepositoryNameChange(e.target.value)
                      }
                      placeholder="repository"
                      className="font-mono text-sm max-w-[160px]"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    If you haven&apos;t forked the repository yet, visit{" "}
                    <Link
                      href="https://github.com/ccfddl/ccf-deadlines"
                      className="text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ccfddl/ccf-deadlines
                    </Link>{" "}
                    to fork it first.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notifications Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <h3 className="text-sm font-medium">Notifications</h3>
            </div>
            <div className="flex items-center justify-between ml-4">
              <div className="space-y-1">
                <Label htmlFor="notifications">Enable Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Receive notifications for upcoming deadlines
                </p>
              </div>
              <Switch
                id="notifications"
                checked={localSettings.notificationsEnabled}
                onCheckedChange={handleNotificationsChange}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
