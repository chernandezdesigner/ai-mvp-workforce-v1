'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ScreenType, HttpMethod, FlowNode } from '@/types/app-architecture';
import {
  Monitor,
  Database,
  Shield,
  LayoutDashboard,
  List,
  FileText,
  PlusCircle,
  User,
  Settings,
  Home,
  X
} from 'lucide-react';

interface NodeEditDialogProps {
  node: FlowNode | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeId: string, updates: Partial<FlowNode['data']>) => void;
}

const screenTypeOptions = [
  { value: ScreenType.AUTH, label: 'Authentication', icon: Shield },
  { value: ScreenType.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { value: ScreenType.LIST, label: 'List View', icon: List },
  { value: ScreenType.DETAIL, label: 'Detail View', icon: FileText },
  { value: ScreenType.FORM, label: 'Form', icon: PlusCircle },
  { value: ScreenType.PROFILE, label: 'Profile', icon: User },
  { value: ScreenType.SETTINGS, label: 'Settings', icon: Settings },
  { value: ScreenType.HOME, label: 'Home', icon: Home },
  { value: ScreenType.ONBOARDING, label: 'Onboarding', icon: User },
  { value: ScreenType.SEARCH, label: 'Search', icon: Monitor },
  { value: ScreenType.NOTIFICATIONS, label: 'Notifications', icon: Monitor },
];

const httpMethodOptions = [
  { value: HttpMethod.GET, label: 'GET', color: 'text-blue-600' },
  { value: HttpMethod.POST, label: 'POST', color: 'text-green-600' },
  { value: HttpMethod.PUT, label: 'PUT', color: 'text-orange-600' },
  { value: HttpMethod.DELETE, label: 'DELETE', color: 'text-red-600' },
  { value: HttpMethod.PATCH, label: 'PATCH', color: 'text-purple-600' },
];

export default function NodeEditDialog({
  node,
  isOpen,
  onClose,
  onSave
}: NodeEditDialogProps) {
  const [formData, setFormData] = useState({
    label: '',
    description: '',
    screenType: ScreenType.DASHBOARD,
    method: HttpMethod.GET,
    path: '',
    requiresAuth: false,
    authentication: false
  });

  useEffect(() => {
    if (node) {
      setFormData({
        label: node.data.label || '',
        description: node.data.description || '',
        screenType: node.data.screenType || ScreenType.DASHBOARD,
        method: node.data.method || HttpMethod.GET,
        path: node.data.path || '',
        requiresAuth: node.data.requiresAuth || false,
        authentication: node.data.authentication || false
      });
    }
  }, [node]);

  const handleSave = () => {
    if (!node) return;
    
    const updates: Partial<FlowNode['data']> = {
      label: formData.label,
      description: formData.description,
    };

    if (node.type === 'screen') {
      updates.screenType = formData.screenType;
      updates.requiresAuth = formData.requiresAuth;
    } else if (node.type === 'api') {
      updates.method = formData.method;
      updates.path = formData.path;
      updates.authentication = formData.authentication;
    }

    onSave(node.id, updates);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!node) return null;

  const isScreenNode = node.type === 'screen';
  const isApiNode = node.type === 'api';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isScreenNode && <Monitor className="w-5 h-5" />}
            {isApiNode && <Database className="w-5 h-5" />}
            Edit {node.type.charAt(0).toUpperCase() + node.type.slice(1)} Node
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Basic Info */}
          <div className="space-y-2">
            <Label htmlFor="label">Name</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              placeholder="Enter node name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter node description"
              rows={3}
            />
          </div>

          {/* Screen-specific fields */}
          {isScreenNode && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Screen Type</Label>
                  <Select
                    value={formData.screenType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, screenType: value as ScreenType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {screenTypeOptions.map(({ value, label, icon: Icon }) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requiresAuth">Requires Authentication</Label>
                    <div className="text-xs text-gray-500">
                      User must be logged in to access
                    </div>
                  </div>
                  <Switch
                    id="requiresAuth"
                    checked={formData.requiresAuth}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresAuth: checked }))}
                  />
                </div>
              </div>
            </>
          )}

          {/* API-specific fields */}
          {isApiNode && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>HTTP Method</Label>
                  <Select
                    value={formData.method}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, method: value as HttpMethod }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {httpMethodOptions.map(({ value, label, color }) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            <Database className={`w-4 h-4 ${color}`} />
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="path">API Path</Label>
                  <Input
                    id="path"
                    value={formData.path}
                    onChange={(e) => setFormData(prev => ({ ...prev, path: e.target.value }))}
                    placeholder="/api/endpoint"
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="authentication">Requires Authentication</Label>
                    <div className="text-xs text-gray-500">
                      API requires authentication header
                    </div>
                  </div>
                  <Switch
                    id="authentication"
                    checked={formData.authentication}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, authentication: checked }))}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
