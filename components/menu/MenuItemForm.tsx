"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MenuItemFormProps {
  menuId: string;
  onSubmit: (data: {
    name: string;
    description: string;
    price: number;
    dietaryTags: string[];
    availableQty: number;
  }) => void;
  loading?: boolean;
}

export function MenuItemForm({ onSubmit, loading }: MenuItemFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [availableQty, setAvailableQty] = useState("10");
  const [tags, setTags] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceInCents = Math.round(parseFloat(price) * 100);
    onSubmit({
      name,
      description,
      price: priceInCents,
      dietaryTags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      availableQty: parseInt(availableQty) || 10,
    });
    setName("");
    setDescription("");
    setPrice("");
    setTags("");
    setAvailableQty("10");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Dish Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Chicken Biryani"
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your dish..."
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="12.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="qty">Available Qty</Label>
          <Input
            id="qty"
            type="number"
            min="1"
            value={availableQty}
            onChange={(e) => setAvailableQty(e.target.value)}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="tags">Dietary Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="vegan, gluten-free, halal"
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-homeplate-orange hover:bg-homeplate-orange-dark"
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Menu Item"}
      </Button>
    </form>
  );
}
