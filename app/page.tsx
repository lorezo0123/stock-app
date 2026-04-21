"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
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
import { Trash2, Package, Store, Warehouse, Search, ScanLine, Link2Off } from "lucide-react";
import dynamic from "next/dynamic";

const BarcodeScanner = dynamic(
  () => import("@/components/ui/BarcodeScanner"),
  { ssr: false }
);

type Item = {
  id: number;
  name: string;
};

type Entry = {
  id: number;
  item_id: number;
  location: "outside" | "storeroom";
  quantity: number;
  created_at?: string;
};

type BarcodeMappingRow = {
  barcode: string;
  item_id: number;
};

const locations = [
  { value: "outside", label: "Outside Selling" },
  { value: "storeroom", label: "Store Room" },
];

const normalizeText = (text: string) =>
  text.toLowerCase().replace(/\s+/g, " ").trim();

export default function ShopStockCountApp() {
  const [items, setItems] = useState<Item[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [newItem, setNewItem] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<"outside" | "storeroom">("outside");
  const [quantity, setQuantity] = useState("1");
  const [search, setSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState("");
  const [pendingBarcode, setPendingBarcode] = useState("");
  const [barcodeMap, setBarcodeMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [editingCell, setEditingCell] = useState<{
    itemId: number;
    location: "outside" | "storeroom";
  } | null>(null);

  const [editingValue, setEditingValue] = useState("");

  const selectedItem = items.find((item) => String(item.id) === selectedItemId);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    const { data: itemsData, error: itemsError } = await supabase
      .from("items")
      .select("id, name")
      .order("name", { ascending: true });

    const { data: entriesData, error: entriesError } = await supabase
      .from("stock_entries")
      .select("id, item_id, location, quantity, created_at")
      .order("created_at", { ascending: false });

    const { data: barcodeData, error: barcodeError } = await supabase
      .from("barcode_mappings")
      .select("barcode, item_id");

    if (itemsError) {
      setError(itemsError.message);
      setLoading(false);
      return;
    }

    if (entriesError) {
      setError(entriesError.message);
      setLoading(false);
      return;
    }

    if (barcodeError) {
      setError(barcodeError.message);
      setLoading(false);
      return;
    }

    setItems((itemsData ?? []) as Item[]);
    setEntries((entriesData ?? []) as Entry[]);

    const barcodeObject: Record<string, number> = {};
    ((barcodeData ?? []) as BarcodeMappingRow[]).forEach((row) => {
      barcodeObject[row.barcode] = row.item_id;
    });
    setBarcodeMap(barcodeObject);

    setLoading(false);
  }

  const filteredItems = items.filter((item) =>
    normalizeText(item.name).includes(normalizeText(itemSearch))
  );

  const getItemName = (itemId: number) => {
    return items.find((item) => item.id === itemId)?.name || "Unknown Item";
  };

  const addItem = async () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;

    const { data, error } = await supabase
      .from("items")
      .insert([{ name: trimmed }])
      .select("id, name")
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    if (data) {
      const newData = data as Item;
      setItems((prev) => [...prev, newData].sort((a, b) => a.name.localeCompare(b.name)));
      setNewItem("");
      setSelectedItemId(String(newData.id));
      setItemSearch(newData.name);
    }
  };

  const chooseItem = (id: number, name: string) => {
    setSelectedItemId(String(id));
    setItemSearch(name);
  };

  const saveBarcodeMatch = async () => {
    if (!pendingBarcode || !selectedItemId) return;

    const itemId = Number(selectedItemId);

    const { error } = await supabase
      .from("barcode_mappings")
      .upsert(
        [{ barcode: pendingBarcode, item_id: itemId }],
        { onConflict: "barcode" }
      );

    if (error) {
      alert(error.message);
      return;
    }

    const found = items.find((item) => item.id === itemId);

    setBarcodeMap((prev) => ({
      ...prev,
      [pendingBarcode]: itemId,
    }));

    setLastScannedCode(pendingBarcode);
    setPendingBarcode("");

    if (found) {
      setSelectedItemId(String(found.id));
      setItemSearch(found.name);
    }

    alert("Barcode match saved successfully.");
  };

  const deleteBarcodeMatch = async () => {
    if (!lastScannedCode) return;

    const confirmDelete = confirm("Are you sure you want to delete this barcode mapping?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("barcode_mappings")
      .delete()
      .eq("barcode", lastScannedCode);

    if (error) {
      alert(error.message);
      return;
    }

    setBarcodeMap((prev) => {
      const updated = { ...prev };
      delete updated[lastScannedCode];
      return updated;
    });

    setLastScannedCode("");
    setPendingBarcode("");
    setSelectedItemId("");
    setItemSearch("");

    alert("Barcode deleted successfully.");
  };

  const addEntry = async (overrideItemId?: number) => {
    const qty = Number(quantity);
    const finalItemId = overrideItemId ?? Number(selectedItemId);

    if (!finalItemId || quantity === "" || qty < 0) return;

    const item = items.find((i) => i.id === finalItemId);

    if (!item) {
      alert("Item not found.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("stock_entries")
      .insert([
        {
          item_id: finalItemId,
          item_name: item.name,
          location: selectedLocation,
          quantity: qty,
        },
      ])
      .select("id, item_id, location, quantity, created_at")
      .single();

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    if (data) {
      setEntries((prev) => [data as Entry, ...prev]);
      setSelectedItemId(String(finalItemId));
      setItemSearch(item.name);
      setQuantity("1");
    }
  };

  const handleDetectedBarcode = async (rawCode: string) => {
    const cleanCode = rawCode.trim();

    setLastScannedCode(cleanCode);
    setShowScanner(false);

    const matchedItemId = barcodeMap[cleanCode];

    if (matchedItemId) {
      const found = items.find((item) => item.id === matchedItemId);

      if (found) {
        setSelectedItemId(String(found.id));
        setItemSearch(found.name);
        setPendingBarcode("");

        await addEntry(found.id);
        return;
      }
    }

    setPendingBarcode(cleanCode);
    setSelectedItemId("");
    setItemSearch("");
  };

  const removeEntry = async (id: number) => {
    const { error } = await supabase.from("stock_entries").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const startEditing = (
    itemId: number,
    location: "outside" | "storeroom",
    currentValue: number
  ) => {
    setEditingCell({ itemId, location });
    setEditingValue(String(currentValue));
  };

  const saveEditedValue = async (
    itemId: number,
    location: "outside" | "storeroom",
    value?: string
  ) => {
    const finalValue = value ?? editingValue;
    const qty = Number(finalValue);

    if (finalValue === "" || qty < 0) return;

    const item = items.find((i) => i.id === itemId);

    if (!item) {
      alert("Item not found.");
      return;
    }

    const matchingEntries = entries.filter(
      (entry) => entry.item_id === itemId && entry.location === location
    );

    if (matchingEntries.length > 0) {
      const idsToDelete = matchingEntries.map((entry) => entry.id);

      const { error: deleteError } = await supabase
        .from("stock_entries")
        .delete()
        .in("id", idsToDelete);

      if (deleteError) {
        alert(deleteError.message);
        return;
      }
    }

    const { data, error } = await supabase
      .from("stock_entries")
      .insert([
        {
          item_id: itemId,
          item_name: item.name,
          location,
          quantity: qty,
        },
      ])
      .select("id, item_id, location, quantity, created_at")
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setEntries((prev) => {
      const filtered = prev.filter(
        (entry) => !(entry.item_id === itemId && entry.location === location)
      );
      return [data as Entry, ...filtered];
    });

    setEditingCell(null);
    setEditingValue("");
  };

  const cancelEditing = () => {
    setEditingCell(null);
    setEditingValue("");
  };

  const summary = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    return items
      .map((item) => {
        const outside = entries
          .filter((entry) => entry.item_id === item.id && entry.location === "outside")
          .reduce((sum, entry) => sum + entry.quantity, 0);

        const storeroom = entries
          .filter((entry) => entry.item_id === item.id && entry.location === "storeroom")
          .reduce((sum, entry) => sum + entry.quantity, 0);

        const total = outside + storeroom;

        return {
          ...item,
          outside,
          storeroom,
          total,
        };
      })
      .filter((item) => {
        if (!normalizedSearch) return true;
        return normalizeText(item.name).includes(normalizedSearch);
      })
      .sort((a, b) => {
        if (a.total > 0 && b.total === 0) return -1;
        if (a.total === 0 && b.total > 0) return 1;
        return b.total - a.total;
      });
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

  if (loading) {
    return <div className="p-6">Loading items from Supabase...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Shop Stock Count</h1>
          <p className="text-sm text-slate-600">
            Scan a barcode to auto save, or choose an item manually and save count.
          </p>
          {error ? <p className="text-sm text-red-600">Error: {error}</p> : null}
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
                    placeholder="Example: Item Name"
                  />
                  <Button onClick={addItem}>Add</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Choose Item</Label>
                <Input
                  value={itemSearch}
                  onChange={(e) => {
                    setItemSearch(e.target.value);
                    setSelectedItemId("");
                  }}
                  placeholder="Search and choose item"
                />

                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  onClick={() => setShowScanner(true)}
                >
                  <ScanLine className="h-4 w-4" />
                  Scan Barcode
                </Button>

                {showScanner && (
                  <BarcodeScanner
                    onDetected={handleDetectedBarcode}
                    onClose={() => setShowScanner(false)}
                  />
                )}

                {pendingBarcode ? (
                  <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm space-y-1">
                    <p className="font-medium text-amber-800">Barcode not found</p>
                    <p className="break-all text-amber-700">{pendingBarcode}</p>
                    <p className="text-amber-700">
                      Choose an existing item below, or add a new item, then tap <strong>Save Barcode Match</strong>.
                    </p>
                  </div>
                ) : null}

                {lastScannedCode ? (
                  <div className="rounded-md border bg-slate-50 p-3 space-y-2">
                    <p className="text-xs text-slate-500 break-all">
                      Last scanned barcode: {lastScannedCode}
                    </p>
                    <Button
                      type="button"
                      variant="destructive"
                      className="w-full flex items-center gap-2"
                      onClick={deleteBarcodeMatch}
                    >
                      <Link2Off className="h-4 w-4" />
                      Delete Barcode Mapping
                    </Button>
                  </div>
                ) : null}

                <div className="max-h-48 overflow-y-auto rounded-md border bg-white">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => chooseItem(item.id, item.name)}
                        className={`w-full border-b px-3 py-2 text-left text-sm last:border-b-0 hover:bg-slate-100 ${
                          String(item.id) === selectedItemId ? "bg-slate-100 font-medium" : ""
                        }`}
                      >
                        {item.name}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-slate-500">No item found</div>
                  )}
                </div>

                {pendingBarcode ? (
                  <Button
                    type="button"
                    className="w-full"
                    onClick={saveBarcodeMatch}
                    disabled={!selectedItemId}
                  >
                    Save Barcode Match
                  </Button>
                ) : null}

                <p className="text-xs text-slate-500">
                  Selected: {selectedItem ? selectedItem.name : "None"}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Select
                  value={selectedLocation}
                  onValueChange={(value) => setSelectedLocation(value as "outside" | "storeroom")}
                >
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
                <p className="text-xs text-slate-500">
                  For auto save after scan, this quantity will be used.
                </p>
              </div>

              <Button className="w-full" onClick={() => addEntry()} disabled={saving}>
                {saving ? "Saving..." : "Save Count"}
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
                    placeholder="Search item summary"
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

                          <TableCell>
                            {editingCell?.itemId === item.id &&
                            editingCell?.location === "outside" ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveEditedValue(item.id, "outside");
                                    if (e.key === "Escape") cancelEditing();
                                  }}
                                  autoFocus
                                  className="h-8 w-20"
                                />
                                <Button type="button" size="sm" onClick={() => saveEditedValue(item.id, "outside")}>
                                  Save
                                </Button>
                                <Button type="button" size="sm" variant="outline" onClick={cancelEditing}>
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEditing(item.id, "outside", item.outside)}
                                className="rounded px-2 py-1 hover:bg-slate-100"
                              >
                                {item.outside}
                              </button>
                            )}
                          </TableCell>

                          <TableCell>
                            {editingCell?.itemId === item.id &&
                            editingCell?.location === "storeroom" ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveEditedValue(item.id, "storeroom");
                                    if (e.key === "Escape") cancelEditing();
                                  }}
                                  autoFocus
                                  className="h-8 w-20"
                                />
                                <Button type="button" size="sm" onClick={() => saveEditedValue(item.id, "storeroom")}>
                                  Save
                                </Button>
                                <Button type="button" size="sm" variant="outline" onClick={cancelEditing}>
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEditing(item.id, "storeroom", item.storeroom)}
                                className="rounded px-2 py-1 hover:bg-slate-100"
                              >
                                {item.storeroom}
                              </button>
                            )}
                          </TableCell>

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
                  {entries.length === 0 ? (
                    <p className="text-sm text-slate-500">No entries yet.</p>
                  ) : (
                    entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex flex-col gap-3 rounded-2xl border bg-white p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="font-semibold">{getItemName(entry.item_id)}</p>
                          <p className="text-sm text-slate-500">
                            {entry.location === "outside" ? "Outside Selling" : "Store Room"}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge className="rounded-xl px-3 py-1 text-sm">
                            Qty: {entry.quantity}
                          </Badge>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeEntry(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}