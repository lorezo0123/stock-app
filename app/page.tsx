"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Package, Store, Warehouse, Search } from "lucide-react";

const starterItems = [
  { id: 1, name: "Coca-Cola 1.5L" },
  { id: 2, name: "Pepsi 1.5L" },
  { id: 3, name: "Mineral Water 600ml" },
  { id: 4, name: "Instant Noodles Curry" },
  { id: 5, name: "Gardenia Bread" },
  { id: 6, name: "Milo 1kg" },
];

const locations = [
  { value: "outside", label: "Outside Selling" },
  { value: "storeroom", label: "Store Room" },
];

export default function ShopStockCountApp() {
  const [items, setItems] = useState(starterItems);
  const [newItem, setNewItem] = useState("");
  const [selectedItemId, setSelectedItemId] = useState(String(starterItems[0].id));
  const [selectedLocation, setSelectedLocation] = useState("outside");
  const [quantity, setQuantity] = useState("");
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState([
    { id: 101, itemId: 1, itemName: "Coca-Cola 1.5L", location: "outside", quantity: 12 },
    { id: 102, itemId: 1, itemName: "Coca-Cola 1.5L", location: "storeroom", quantity: 30 },
    { id: 103, itemId: 2, itemName: "Pepsi 1.5L", location: "outside", quantity: 8 },
  ]);

  const addItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    const next = { id: Date.now(), name: trimmed };
    setItems((prev) => [...prev, next]);
    setNewItem("");
    setSelectedItemId(String(next.id));
  };

  const addEntry = () => {
    const qty = Number(quantity);
    if (!selectedItemId || !qty || qty < 0) return;
    const found = items.find((item) => String(item.id) === selectedItemId);
    if (!found) return;

    setEntries((prev) => [
      {
        id: Date.now(),
        itemId: found.id,
        itemName: found.name,
        location: selectedLocation,
        quantity: qty,
      },
      ...prev,
    ]);
    setQuantity("");
  };

  const removeEntry = (id: number) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const summary = useMemo(() => {
    return items
      .map((item) => {
        const outside = entries
          .filter((entry) => entry.itemId === item.id && entry.location === "outside")
          .reduce((sum, entry) => sum + entry.quantity, 0);

        const storeroom = entries
          .filter((entry) => entry.itemId === item.id && entry.location === "storeroom")
          .reduce((sum, entry) => sum + entry.quantity, 0);

        const total = outside + storeroom;

        return {
          ...item,
          outside,
          storeroom,
          total,
        };
      })
      .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  }, [items, entries, search]);

  const grandTotals = useMemo(() => {
    const outside = summary.reduce((sum, item) => sum + item.outside, 0);
    const storeroom = summary.reduce((sum, item) => sum + item.storeroom, 0);
    return {
      outside,
      storeroom,
      total: outside + storeroom,
    };
  }, [summary]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Shop Stock Count</h1>
          <p className="text-sm text-slate-600">
            Choose an item, enter quantity, pick the location, and the totals update automatically.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="rounded-2xl shadow-sm lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Package className="h-5 w-5" /> Add Count
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Add New Item</Label>
                <div className="flex gap-2">
                  <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Example: Sprite 1.5L"
                  />
                  <Button onClick={addItem}>Add</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Choose Item</Label>
                <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.value} value={location.value}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>

              <Button className="w-full" onClick={addEntry}>
                Save Count
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:col-span-2">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="rounded-2xl shadow-sm">
                <CardContent className="flex items-center gap-3 p-5">
                  <div className="rounded-2xl bg-slate-100 p-3">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Outside Selling</p>
                    <p className="text-2xl font-bold">{grandTotals.outside}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardContent className="flex items-center gap-3 p-5">
                  <div className="rounded-2xl bg-slate-100 p-3">
                    <Warehouse className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Store Room</p>
                    <p className="text-2xl font-bold">{grandTotals.storeroom}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardContent className="flex items-center gap-3 p-5">
                  <div className="rounded-2xl bg-slate-100 p-3">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Grand Total</p>
                    <p className="text-2xl font-bold">{grandTotals.total}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-xl">Item Summary</CardTitle>
                <div className="relative w-full md:max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search item"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Outside Selling</TableHead>
                        <TableHead>Store Room</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.outside}</TableCell>
                          <TableCell>{item.storeroom}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="rounded-xl px-3 py-1">
                              {item.total}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Recent Count Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex flex-col gap-3 rounded-2xl border bg-white p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-semibold">{entry.itemName}</p>
                        <p className="text-sm text-slate-500">
                          {entry.location === "outside" ? "Outside Selling" : "Store Room"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="rounded-xl px-3 py-1 text-sm">Qty: {entry.quantity}</Badge>
                        <Button variant="outline" size="icon" onClick={() => removeEntry(entry.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}