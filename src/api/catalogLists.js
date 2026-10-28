import { getInstance } from "./axios";
import { readListPagination, readListTotal } from "./listPagination";

export const CATALOG_PAGE_SIZE = 500;
export const MAX_CATALOG_PAGES = 1000;
export const CATALOG_REQUEST_TIMEOUT_MS = 15000;
export const CATALOG_LOAD_TIMEOUT_MS = 120000;

// Complete collections for catalog consumers only. Page count is known before
// iteration; storage is updated by the caller only after this load succeeds.
export async function listCatalogPages({ entity, url, params = {}, signal, pageSize = CATALOG_PAGE_SIZE, mainKey = "id" }) {
  if (!Number.isSafeInteger(pageSize) || pageSize < 1) throw new Error("Tamaño de catálogo inválido");
  const controller = new AbortController();
  const forwardAbort = () => controller.abort(signal?.reason);
  if (signal?.aborted) forwardAbort();
  signal?.addEventListener("abort", forwardAbort, { once: true });
  const deadline = setTimeout(() => controller.abort(new Error("Tiempo máximo de carga de catálogo excedido")), CATALOG_LOAD_TIMEOUT_MS);
  const values = [];
  const seen = new Set();
  const fail = message => { throw new Error(`Catálogo ${entity}: ${message}`); };
  const fetchPage = async (pageNumber, count, size) => {
    if (controller.signal.aborted) fail("carga cancelada");
    const { data } = await getInstance().get(url, {
      params: { ...params, pageNumber, pageSize: size, count },
      signal: controller.signal,
      timeout: CATALOG_REQUEST_TIMEOUT_MS,
    });
    if (controller.signal.aborted) fail("carga cancelada");
    if (data?.statusOk === false) fail(data.message || data.error?.message || "request fallida");
    if (!Array.isArray(data?.[entity])) fail(`response sin array ${entity}`);
    const metadata = readListPagination(data);
    if (metadata.pageNumber !== undefined && metadata.pageNumber !== pageNumber) fail("backend no avanzó a la página solicitada");
    return data;
  };
  const appendPage = (data, expectedItems) => {
    const items = data[entity];
    if (items.length !== expectedItems) fail(`página incompleta: ${items.length} de ${expectedItems} registros esperados`);
    for (const item of items) {
      const id = item?.[mainKey];
      if (id == null || id === "") fail(`registro sin ${mainKey}`);
      if (seen.has(id)) fail(`registro repetido entre páginas: ${id}`);
      seen.add(id);
      values.push(item);
    }
  };
  try {
    const first = await fetchPage(1, true, pageSize);
    const total = readListTotal(first);
    if (!Number.isSafeInteger(total) || total < 0) fail("response sin count/total válido; no se solicitarán más páginas");
    const effectiveSize = readListPagination(first).pageSize ?? pageSize;
    const totalPages = Math.ceil(total / effectiveSize);
    if (totalPages > MAX_CATALOG_PAGES) fail(`conteo excede límite de ${MAX_CATALOG_PAGES} páginas`);
    appendPage(first, Math.min(total, effectiveSize));
    for (let pageNumber = 2; pageNumber <= totalPages; pageNumber++) {
      const page = await fetchPage(pageNumber, false, effectiveSize);
      const metadata = readListPagination(page);
      if (metadata.pageSize !== undefined && metadata.pageSize !== effectiveSize) fail("backend cambió tamaño de página durante carga");
      const pageTotal = readListTotal(page);
      if (pageTotal !== undefined && pageTotal !== total) fail("conteo cambió durante carga");
      appendPage(page, Math.min(effectiveSize, total - values.length));
    }
    return values;
  } finally {
    clearTimeout(deadline);
    signal?.removeEventListener("abort", forwardAbort);
  }
}
