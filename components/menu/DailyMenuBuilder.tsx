"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { MenuItemForm } from "./MenuItemForm";
import { SoldOutToggle } from "./SoldOutToggle";
import {
  ChefHat,
  ArrowLeft,
  Plus,
  Trash2,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/validations";
import Link from "next/link";

interface MenuItem {
  id: string;
  menu_id: string;
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  dietary_tags: string[];
  available_qty: number | null;
  qty_remaining: number | null;
  sold_out: boolean;
}

interface ExistingMenu {
  id: string;
  active: boolean;
  mealsRemaining: number;
  availableFrom: string | null;
  availableUntil: string | null;
  notes: string | null;
  fulfillmentTypes: string[];
}

interface DailyMenuBuilderProps {
  date: string;
  cookId: string;
  existingMenu: ExistingMenu | null;
  existingItems: MenuItem[];
}

export function DailyMenuBuilder({
  date,
  cookId,
  existingMenu,
  existingItems,
}: DailyMenuBuilderProps) {
  const [menu, setMenu] = useState<ExistingMenu | null>(existingMenu);
  const [items, setItems] = useState<MenuItem[]>(existingItems);
  const [showAddForm, setShowAddForm] = useState(false);
  const [availableFrom, setAvailableFrom] = useState(
    existingMenu?.availableFrom ?? "11:00"
  );
  const [availableUntil, setAvailableUntil] = useState(
    existingMenu?.availableUntil ?? "19:00"
  );
  const [notes, setNotes] = useState(existingMenu?.notes ?? "");
  const [pickup, setPickup] = useState(
    existingMenu?.fulfillmentTypes?.includes("pickup") ?? true
  );
  const [dineIn, setDineIn] = useState(
    existingMenu?.fulfillmentTypes?.includes("dine_in") ?? false
  );
  const [menuActive, setMenuActive] = useState(existingMenu?.active ?? true);
  const [creatingMenu, setCreatingMenu] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const d = new Date(date + "T12:00:00");
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const dateLabel = `${dayNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${d.getDate()}`;

  const createOrUpdateMenu = useCallback(async () => {
    setCreatingMenu(true);
    const fulfillmentTypes = [
      ...(pickup ? ["pickup"] : []),
      ...(dineIn ? ["dine_in"] : []),
    ];

    try {
      const res = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          availableFrom,
          availableUntil,
          notes: notes || null,
          fulfillmentTypes,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to save menu");
        setCreatingMenu(false);
        return null;
      }

      setMenu({
        id: json.menu.id,
        active: json.menu.active,
        mealsRemaining: json.menu.meals_remaining,
        availableFrom: json.menu.available_from,
        availableUntil: json.menu.available_until,
        notes: json.menu.notes,
        fulfillmentTypes: json.menu.fulfillment_types,
      });

      toast.success("Menu saved");
      setCreatingMenu(false);
      return json.menu.id as string;
    } catch {
      toast.error("Failed to save menu");
      setCreatingMenu(false);
      return null;
    }
  }, [date, availableFrom, availableUntil, notes, pickup, dineIn]);

  async function handleAddItem(data: {
    name: string;
    description: string;
    price: number;
    dietaryTags: string[];
    availableQty: number;
  }) {
    setAddingItem(true);
    let menuId: string | null = menu?.id ?? null;

    if (!menuId) {
      menuId = await createOrUpdateMenu();
      if (!menuId) {
        setAddingItem(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuId,
          name: data.name,
          description: data.description || null,
          price: data.price,
          dietaryTags: data.dietaryTags,
          availableQty: data.availableQty,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to add item");
        setAddingItem(false);
        return;
      }

      setItems((prev) => [
        ...prev,
        {
          id: json.item.id,
          menu_id: json.item.menu_id,
          name: json.item.name,
          description: json.item.description,
          price: json.item.price,
          photo_url: json.item.photo_url,
          dietary_tags: json.item.dietary_tags,
          available_qty: json.item.available_qty,
          qty_remaining: json.item.qty_remaining,
          sold_out: json.item.sold_out,
        },
      ]);

      setShowAddForm(false);
      toast.success(`Added "${data.name}"`);
    } catch {
      toast.error("Failed to add item");
    }

    setAddingItem(false);
  }

  async function handleToggleSoldOut(itemId: string, soldOut: boolean) {
    try {
      const res = await fetch(`/api/menu-items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sold_out: soldOut }),
      });

      if (res.ok) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, sold_out: soldOut } : item
          )
        );
      }
    } catch {
      toast.error("Failed to update item");
    }
  }

  async function handleDeleteItem(itemId: string) {
    setDeletingId(itemId);
    try {
      const res = await fetch(`/api/menu-items/${itemId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
        toast.success("Item removed");
      }
    } catch {
      toast.error("Failed to delete item");
    }
    setDeletingId(null);
  }

  async function handleToggleActive() {
    if (!menu) return;
    const newActive = !menuActive;
    setMenuActive(newActive);

    try {
      await fetch(`/api/menus/${menu.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newActive }),
      });
      toast.success(newActive ? "Menu published" : "Menu unpublished");
    } catch {
      setMenuActive(!newActive);
      toast.error("Failed to update menu");
    }
  }

  async function handleSaveSettings() {
    if (menu) {
      await createOrUpdateMenu();
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/menu">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-homeplate-dark">{dateLabel}</h1>
          <p className="text-sm text-gray-500">
            {menu
              ? `${items.length} item${items.length !== 1 ? "s" : ""} · ${menu.mealsRemaining} meals remaining`
              : "Create your menu for this day"}
          </p>
        </div>
        {menu && (
          <div className="flex items-center gap-2">
            <Label htmlFor="menu-active" className="text-sm">
              {menuActive ? "Published" : "Draft"}
            </Label>
            <Switch
              id="menu-active"
              checked={menuActive}
              onCheckedChange={handleToggleActive}
            />
          </div>
        )}
      </div>

      {/* Legal notice */}
      <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
        <ChefHat className="mb-0.5 inline h-4 w-4" />{" "}
        All items automatically display{" "}
        <strong>&quot;Made in a Home Kitchen&quot;</strong> to comply with
        California MEHKO law.
      </div>

      {/* Menu settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Menu Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from">Available From</Label>
              <Input
                id="from"
                type="time"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="until">Available Until</Label>
              <Input
                id="until"
                type="time"
                value={availableUntil}
                onChange={(e) => setAvailableUntil(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes for Customers</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Pickup from side door, text when arriving..."
              rows={2}
            />
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="pickup"
                checked={pickup}
                onCheckedChange={setPickup}
              />
              <Label htmlFor="pickup">Pickup</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="dine-in"
                checked={dineIn}
                onCheckedChange={setDineIn}
              />
              <Label htmlFor="dine-in">Dine-in</Label>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleSaveSettings}
            disabled={creatingMenu}
          >
            {creatingMenu && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {menu ? "Update Settings" : "Create Menu"}
          </Button>
        </CardContent>
      </Card>

      {/* Menu items */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Menu Items</h2>
          <Button
            size="sm"
            className="bg-homeplate-orange hover:bg-homeplate-orange/90"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {showAddForm && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">New Menu Item</CardTitle>
            </CardHeader>
            <CardContent>
              <MenuItemForm
                menuId={menu?.id ?? ""}
                onSubmit={handleAddItem}
                loading={addingItem}
              />
            </CardContent>
          </Card>
        )}

        <div className="mt-4 space-y-3">
          {items.length === 0 && !showAddForm ? (
            <Card>
              <CardContent className="py-8 text-center">
                <ChefHat className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No items yet. Add your first dish!
                </p>
              </CardContent>
            </Card>
          ) : (
            items.map((item) => (
              <Card
                key={item.id}
                className={item.sold_out ? "opacity-60" : ""}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{item.name}</h3>
                        <span className="text-sm font-semibold text-homeplate-orange">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                      {item.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {item.description}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {item.dietary_tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.qty_remaining !== null && (
                          <span className="text-xs text-gray-500">
                            {item.qty_remaining} remaining
                          </span>
                        )}
                        <Badge variant="outline" className="text-xs">
                          Made in a Home Kitchen
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <SoldOutToggle
                        itemId={item.id}
                        soldOut={item.sold_out}
                        onToggle={handleToggleSoldOut}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Separator />

      <p className="text-center text-xs text-gray-400">
        Permit #{cookId.slice(0, 8)} · MEHKO compliant · 30 meals/day limit
      </p>
    </div>
  );
}
