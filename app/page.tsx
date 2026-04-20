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
import BarcodeScanner from "@/components/ui/BarcodeScanner";

const starterItems = [
  { id: 1, name: "7114 DUNHILL LIGHTS (BIRU) 20PCS" },
  { id: 2, name: "7113 DUNHILL MENTHOL (HIJAU) 20PCS" },
  { id: 3, name: "7228 DUNHILL MIX 20PCS" },
  { id: 4, name: "7422 DUNHILL SWITCH (GOLD) 20PCS" },
  { id: 5, name: "7481 ROTHMANS CARBON CHARCOAL FILTER 20PCS" },
  { id: 6, name: "7492 ROTHMANS PURPLE 20PCS" },
  { id: 7, name: "7089 MARLBORO FILTER SOFT BOX (R) 20PCS" },
  { id: 8, name: "7088 MARLBORO FILTER BOX (R) 20PCS" },
  { id: 9, name: "7095 MARLBORO FILTER BOX (GOLD) 20PCS" },
  { id: 10, name: "7096 MARLBORO MENTHOL BLACK 20PCS" },
  { id: 11, name: "7388 MARLBORO ICE BLAST BOX (B) 20PCS" },
  { id: 12, name: "7168 MARLBORO DOUBLE BURST 20PCS" },
  { id: 13, name: "7117 BENSON & HEDGES SPECIAL FILTER 20PCS" },
  { id: 14, name: "7383 PETER STUYVESANT FILTER FULL (R) 20PCS" },
  { id: 15, name: "7384 PETER STUYVESANT FILTER LIGHT (B) 20PCS" },
  { id: 16, name: "7001 KYO ORIGINAL FILTER (RED) 20PCS" },
  { id: 17, name: "7043 KYO ORIGINAL 20PCS" },
  { id: 18, name: "7044 KYO SILVER 20PCS" },
  { id: 19, name: "7478 CHESTERFIELD CHARCOAL 20PCS" },
  { id: 20, name: "7189 CHESTERFIELD RED 20PCS" },
  { id: 21, name: "7190 CHESTERFIELD BLUE 20PCS" },
  { id: 22, name: "7396 CHESTERFIELD MENTHOL 20PCS" },
  { id: 23, name: "10384 CHESTERFIELD PURPLE 20PCS" },
  { id: 24, name: "7129 SAMPOERNA A MENTHOL BOX (G) 20PCS" },
  { id: 25, name: "7127 SAMPOERNA A BOX (R) 20PCS" },
  { id: 26, name: "7362 TEREA AMBER 20PCS" },
  { id: 27, name: "7363 TEREA BLUE 20PCS" },
  { id: 28, name: "7364 TEREA BLACK GREEN 20PCS" },
  { id: 29, name: "7550 TEREA ZING WAVE 20PCS" },
  { id: 30, name: "7551 TEREA SIENNA 20PCS" },
  { id: 31, name: "7552 TEREA PURPLE WAVE 20PCS" },
  { id: 32, name: "7123 MEVIUS SALEM MENTHOL BOX (G) 20PCS" },
  { id: 33, name: "7078 MEVIUS MENTHOL DUO (GREEN) BOX 20PCS" },
  { id: 34, name: "7267 MEVIUS MENTHOL WHITE 20PCS" },
  { id: 35, name: "7504 MEVIUS KIWAMI 20PCS" },
  { id: 36, name: "7409 WINSTON EXCEL CAPSULE DUO BLUE 20PCS" },
  { id: 37, name: "7125 WINSTON (RED) 20PCS" },
  { id: 38, name: "7215 WINSTON (BLUE) 20PCS" },
  { id: 39, name: "7400 LD ZOOM 20PCS" },
  { id: 40, name: "7438 LD PURPLE 20PCS" },
  { id: 41, name: "7292 LD RED ROW 20PCS" },
  { id: 42, name: "7347 LD 100S RED 20PCS" },
  { id: 43, name: "7269 MEVIUS ORIGINAL BLUE 20PCS" },
  { id: 44, name: "7271 MEVIUS SKY BLUE BOX (B) 20PCS" },
  { id: 45, name: "7367 LD BLUE 20PCS" },
  { id: 46, name: "7369 LD MENTHOL 20PCS" },
  { id: 47, name: "7333 DUNHILL CLASSIC PACK (M) 20PCS" },
  { id: 48, name: "7110 DUNHILL KING SIZE FILTER (M) 20PCS" },
  { id: 49, name: "7393 ROTHMANS RED 20PCS" },
  { id: 50, name: "7394 ROTHMANS BLUE 20PCS" },
  { id: 51, name: "7344 LUCKIES RED 20PCS" },
  { id: 52, name: "7345 LUCKIES BLUE 20PCS" },
  { id: 53, name: "7349 LD RED 20PCS" },

  { id: 54, name: "501 MALTA CAN 320ML" },
  { id: 55, name: "484 ANGLIA SHANDY CAN 320ML" },
  { id: 56, name: "481 GUINNESS CAN 320ML" },
  { id: 57, name: "483 CARLSBERG CAN 320ML" },
  { id: 58, name: "485 CARLSBERG SPECIAL BREW CAN 320ML" },
  { id: 59, name: "2101 CARLSBERG SMOOTH DRAUGHT CAN 320ML" },
  { id: 60, name: "489 TIGER BEER CAN 320ML" },
  { id: 61, name: "2494 HEINEKEN BEER CAN 320ML" },
  { id: 62, name: "498 ROYAL STOUT CAN 320ML (ICE)" },
  { id: 63, name: "5175 SKOL BEER TIN 320ML" },
  { id: 64, name: "2103 KRONENBOURG 1664 BLANC CAN 320ML" },
  { id: 65, name: "2718 ASAHI BEER CAN 320ML" },
  { id: 66, name: "0960 ANCHOR SMOOTH CAN 320ML" },
  { id: 67, name: "3369 TIGER CRYSTAL BEER CAN 320ML" },
  { id: 68, name: "3513 CONNORS STOUT PORTER 320ML" },
  { id: 69, name: "2249 CARLSBERG SMOOTH DRAUGHT 680ML BOTTLE" },
  { id: 70, name: "557 GUINNESS BOTTLE 640ML" },
  { id: 71, name: "658 CARLSBERG BOTTLE 640ML" },
  { id: 72, name: "559 TIGER BEER BOTTLE 660ML" },
  { id: 73, name: "5054 HEINEKEN BEER BOTTLE 640ML" },
  { id: 74, name: "7017 SOMERSBY APPLE CIDER 330ML" },

  { id: 75, name: "SAPPORO" }
];

const locations = [
  { value: "outside", label: "Outside Selling" },
  { value: "storeroom", label: "Store Room" },
];

const normalizeText = (text: string) =>
  text.toLowerCase().replace(/\s+/g, " ").trim();

export default function ShopStockCountApp() {
  const [items, setItems] = useState(starterItems);
  const [newItem, setNewItem] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("outside");
  const [quantity, setQuantity] = useState("");
  const [search, setSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState("");
  const [pendingBarcode, setPendingBarcode] = useState("");
  const [barcodeMap, setBarcodeMap] = useState<Record<string, number>>({});
  const [entries, setEntries] = useState<
    { id: number; itemId: number; itemName: string; location: string; quantity: number }[]
  >([]);

  const [editingCell, setEditingCell] = useState<{
    itemId: number;
    location: "outside" | "storeroom";
  } | null>(null);

  const [editingValue, setEditingValue] = useState("");

  const selectedItem = items.find((item) => String(item.id) === selectedItemId);

  const filteredItems = items.filter((item) =>
    normalizeText(item.name).includes(normalizeText(itemSearch))
  );

  const addItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;

    const next = { id: Date.now(), name: trimmed };
    setItems((prev) => [...prev, next]);
    setNewItem("");
    setSelectedItemId(String(next.id));
    setItemSearch(next.name);
  };

  const chooseItem = (id: number, name: string) => {
    setSelectedItemId(String(id));
    setItemSearch(name);
  };

  const saveBarcodeMatch = () => {
    if (!pendingBarcode || !selectedItemId) return;

    const itemId = Number(selectedItemId);
    setBarcodeMap((prev) => ({
      ...prev,
      [pendingBarcode]: itemId,
    }));

    setPendingBarcode("");
    alert("Barcode match saved successfully.");
  };

  const addEntry = () => {
    const qty = Number(quantity);

    if (!selectedItemId || quantity === "" || qty < 0) return;

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

  const startEditing = (
    itemId: number,
    location: "outside" | "storeroom",
    currentValue: number
  ) => {
    setEditingCell({ itemId, location });
    setEditingValue(String(currentValue));
  };

  const saveEditedValue = (
    itemId: number,
    location: "outside" | "storeroom",
    value?: string
  ) => {
    const finalValue = value ?? editingValue;
    const qty = Number(finalValue);

    if (finalValue === "" || qty < 0) return;

    const found = items.find((item) => item.id === itemId);
    if (!found) return;

    setEntries((prev) => {
      const filtered = prev.filter(
        (entry) => !(entry.itemId === itemId && entry.location === location)
      );

      return [
        {
          id: Date.now(),
          itemId: found.id,
          itemName: found.name,
          location,
          quantity: qty,
        },
        ...filtered,
      ];
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
                  className="w-full"
                  onClick={() => setShowScanner(true)}
                >
                  Scan Barcode
                </Button>

                {showScanner && (
                  <BarcodeScanner
                    onDetected={(code) => {
                      setLastScannedCode(code);
                      setShowScanner(false);

                      const matchedItemId = barcodeMap[code];

                      if (matchedItemId) {
                        const found = items.find((item) => item.id === matchedItemId);
                        if (found) {
                          setSelectedItemId(String(found.id));
                          setItemSearch(found.name);
                          setPendingBarcode("");
                          alert(`Matched item: ${found.name}`);
                        }
                      } else {
                        setPendingBarcode(code);
                        setSelectedItemId("");
                        setItemSearch("");
                        alert("Barcode not found. Please choose an item, then tap Save Barcode Match.");
                      }
                    }}
                    onClose={() => setShowScanner(false)}
                  />
                )}

                {pendingBarcode ? (
                  <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
                    <p className="font-medium text-amber-800">Unknown barcode detected</p>
                    <p className="text-amber-700 break-all">{pendingBarcode}</p>
                    <p className="mt-1 text-amber-700">
                      Choose the correct item from the list below, then save the match.
                    </p>
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

                {lastScannedCode ? (
                  <p className="text-xs text-slate-500">
                    Last scanned barcode: {lastScannedCode}
                  </p>
                ) : null}
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
                        <TableHead>Outside Selling (click to edit)</TableHead>
                        <TableHead>Store Room (click to edit)</TableHead>
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
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => saveEditedValue(item.id, "outside")}
                                >
                                  Save
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEditing}
                                >
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
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => saveEditedValue(item.id, "storeroom")}
                                >
                                  Save
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEditing}
                                >
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
                          <p className="font-semibold">{entry.itemName}</p>
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