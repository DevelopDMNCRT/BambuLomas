<template>
  <AdminLayout>
    <div class="p-6">
      <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 dark:text-white/90">Inventario</h1>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative w-full sm:w-64">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar insumo..."
              class="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-white"
            />
            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div class="flex items-center gap-3">
            <Button size="sm" :startIcon="PrinterIcon" @click="imprimirInventario">Imprimir</Button>
          </div>
        </div>
      </div>

      <div v-if="errorMsg" class="mb-6 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
        {{ errorMsg }}
      </div>

      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div v-if="loading" class="flex flex-col items-center justify-center py-12">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">Cargando inventario...</p>
        </div>
        <div v-else-if="!filteredInventario.length" class="flex flex-col items-center justify-center py-12">
          <p class="text-sm text-gray-500 dark:text-gray-400">No hay productos que coincidan con la búsqueda.</p>
        </div>
        <div v-else class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-5 py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">ID</p></th>
                <th class="px-5 py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Nombre</p></th>
                <th class="px-5 py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Stock</p></th>
                <th class="px-5 py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Última Compra</p></th>
                <th class="px-5 py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Mínimos</p></th>
                <th class="px-5 py-3 text-left"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Costo Real</p></th>
                <th class="px-5 py-3 text-center"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Acciones</p></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="(item, index) in filteredInventario" :key="index" class="border-t border-gray-100 dark:border-gray-800">
                <td class="px-5 py-4"><span class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{{ item.id }}</span></td>
                <td class="px-5 py-4"><p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ item.nombre }}</p></td>
                <td class="px-5 py-4"><p class="text-gray-800 font-medium text-theme-sm dark:text-white/90">{{ item.stock }}</p></td>
                <td class="px-5 py-4"><p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ item.ultimaCompra }}</p></td>
                <td class="px-5 py-4"><p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ item.minimos }}</p></td>
                <td class="px-5 py-4"><p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ formatCurrency(item.costoReal) }}</p></td>
                <td class="px-5 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <button @click="goToHistory(item)" class="text-gray-400 hover:text-brand-500 transition-colors" title="Ver Historial">
                      <HistoryIcon class="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Button from '@/components/ui/Button.vue';
import { PrinterIcon, HistoryIcon } from '@/icons';
import { useInventario, type InventarioItem } from '@/composables/useInventario';

const router = useRouter();
const { getInventario } = useInventario();

const inventario = ref<InventarioItem[]>([]);
const loading = ref(true);
const errorMsg = ref('');
const searchQuery = ref('');

const filteredInventario = computed(() => {
  if (!searchQuery.value) return inventario.value;
  const search = searchQuery.value.toLowerCase();
  return inventario.value.filter(item => item.nombre?.toLowerCase().includes(search));
});

const loadInventario = async () => {
  loading.value = true;
  errorMsg.value = '';
  try {
    inventario.value = await getInventario();
  } catch (err: any) {
    errorMsg.value = err.message || 'Error al obtener el inventario';
  } finally {
    loading.value = false;
  }
};

onMounted(() => { loadInventario(); });

const goToHistory = (item: InventarioItem) => {
  router.push({ path: '/inventario/historial', query: { id: item.id, nombre: item.nombre } });
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

const imprimirInventario = () => {
  const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  const hora  = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  const datos = filteredInventario.value;

  const getStockNum = (item: InventarioItem) =>
    typeof item.stockVal === 'number' ? item.stockVal : parseFloat(item.stockVal as any) || 0;
  const getMinNum = (item: InventarioItem) =>
    typeof item.minimosVal === 'number' ? item.minimosVal : parseFloat(item.minimosVal as any) || 0;

  const filas = datos.map((item, i) => {
    const bg         = i % 2 === 0 ? '#ffffff' : '#f0f7f6';
    const stockBajo  = getStockNum(item) <= getMinNum(item);
    const stockColor = stockBajo ? '#dc2626' : '#166534';
    const stockBg    = stockBajo ? '#fef2f2' : '#f0fdf4';
    return `<tr style="background:${bg}">
      <td style="padding:6px 9px;border:1px solid #cde3e0;font-size:10px;color:#374151">${item.id}</td>
      <td style="padding:6px 9px;border:1px solid #cde3e0;font-size:10px;font-weight:600;color:#111827">${item.nombre}</td>
      <td style="padding:6px 9px;border:1px solid #cde3e0;font-size:10px;font-weight:700;color:${stockColor};background:${stockBg};text-align:center">${item.stock}</td>
      <td style="padding:6px 9px;border:1px solid #cde3e0;font-size:10px;color:#374151;text-align:center">${item.ultimaCompra || '—'}</td>
      <td style="padding:6px 9px;border:1px solid #cde3e0;font-size:10px;color:#374151;text-align:center">${item.minimos}</td>
      <td style="padding:6px 9px;border:1px solid #cde3e0;font-size:10px;color:#374151;text-align:right">${formatCurrency(item.costoReal)}</td>
      <td style="padding:6px 9px;border:1px solid #cde3e0;font-size:10px;color:${stockBajo ? '#dc2626' : '#166534'};text-align:center;font-weight:700">${stockBajo ? '⚠ Bajo' : '✓ OK'}</td>
    </tr>`;
  }).join('');

  const total    = datos.length;
  const bajos    = datos.filter(i => getStockNum(i) <= getMinNum(i)).length;
  const filtroHtml = searchQuery.value
    ? `<div class="divider"></div><div class="stat"><span class="stat-val" style="font-size:12px;color:#6b7280">Filtro: &ldquo;${searchQuery.value}&rdquo;</span><span class="stat-lbl">Resultados filtrados</span></div>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"/><title>Inventario — Bambú Lomas</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,Helvetica,sans-serif;background:#fff;color:#111}
.header{background: linear-gradient(to top, #1f5049, #2d6a62 0%, #40897f 18.07%);padding:16px 26px;display:flex;align-items:center;justify-content:space-between}

.header-left{display:flex;align-items:center;gap:13px}
.brand-name h1{color:#fff;font-size:20px;font-weight:800;letter-spacing:.4px}
.brand-name p{color:rgba(255,255,255,.8);font-size:9.5px;margin-top:2px;letter-spacing:.3px;text-transform:uppercase}
.header-right{text-align:right}
.doc-title{color:#fff;font-size:15px;font-weight:700;letter-spacing:.5px;text-transform:uppercase}
.doc-meta{color:rgba(255,255,255,.75);font-size:9.5px;margin-top:3px}
.summary-bar{background:#f0f7f6;border-top:3px solid #2d6a62;border-bottom:1px solid #cde3e0;padding:9px 26px;display:flex;gap:30px;align-items:center}
.stat{display:flex;flex-direction:column}
.stat-val{font-size:19px;font-weight:800;color:#2d6a62;line-height:1}
.stat-lbl{font-size:8.5px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;margin-top:2px}
.stat-warn .stat-val{color:#dc2626}
.divider{width:1px;height:34px;background:#cde3e0}
.table-wrap{padding:13px 26px 26px}
.section-title{font-size:10px;font-weight:700;color:#2d6a62;text-transform:uppercase;letter-spacing:.6px;margin-bottom:7px;padding-bottom:4px;border-bottom:2px solid #2d6a62}
table{width:100%;border-collapse:collapse}
thead tr{background:#2d6a62}
thead th{padding:7px 9px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#fff;border:1px solid #245c55;text-align:left}
thead th.c{text-align:center}thead th.r{text-align:right}
.footer{margin-top:14px;border-top:2px solid #2d6a62;padding-top:6px;display:flex;justify-content:space-between;align-items:center}
.footer span{font-size:8.5px;color:#6b7280}
.footer .brand{font-weight:700;color:#2d6a62}
@media print{@page{size:A4 landscape;margin:8mm}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="header">
  <div class="header-left">
    <img src="data:image/png;base64,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" style="height:44px;object-fit:contain" alt="Bambú Lomas" />
  </div>
  <div class="header-right">
    <div class="doc-title">Reporte de Inventario</div>
    <div class="doc-meta">${fecha} &nbsp;|&nbsp; ${hora}</div>
  </div>
</div>
<div class="summary-bar">
  <div class="stat"><span class="stat-val">${total}</span><span class="stat-lbl">Total insumos</span></div>
  <div class="divider"></div>
  <div class="stat stat-warn"><span class="stat-val">${bajos}</span><span class="stat-lbl">Stock bajo</span></div>
  <div class="divider"></div>
  <div class="stat"><span class="stat-val">${total - bajos}</span><span class="stat-lbl">Stock OK</span></div>
  ${filtroHtml}
</div>
<div class="table-wrap">
  <p class="section-title">Detalle de inventario</p>
  <table>
    <thead><tr>
      <th style="width:86px">ID</th>
      <th>Nombre del Insumo</th>
      <th class="c" style="width:98px">Stock Actual</th>
      <th class="c" style="width:105px">Última Compra</th>
      <th class="c" style="width:86px">Mínimos</th>
      <th class="r"  style="width:94px">Costo Unit.</th>
      <th class="c"  style="width:74px">Estado</th>
    </tr></thead>
    <tbody>${filas}</tbody>
  </table>
  <div class="footer">
    <span>Generado por Bambú Cloud — ${fecha} ${hora}</span>
    <span class="brand">Bambú Lomas — Cocina Saludable</span>
    <span>Total: ${total} insumos &nbsp;|&nbsp; ${bajos} bajo mínimo</span>
  </div>
</div>
<script>window.onload=function(){window.print()}<\/script>
</body></html>`;

  const win = window.open('', '_blank', 'width=1150,height=780');
  if (win) { win.document.write(html); win.document.close(); }
};
</script>
