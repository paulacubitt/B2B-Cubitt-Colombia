
import { Product, ProductVariant } from '../types';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { PRODUCTS } from '../constants';

// Definición laxa para permitir normalización dinámica de columnas
export interface DataRow {
  [key: string]: any;
}

export const getFallbackRawProducts = (): DataRow[] => {
  const rows: DataRow[] = [];
  PRODUCTS.forEach(p => {
    p.variants.forEach(v => {
      rows.push({
        'Handle': p.handle,
        'Title': p.title,
        'Type': p.type,
        'Category': p.category,
        'Description': p.description,
        'Vendor': p.vendor,
        'Tags': (p.tags || []).join(', '),
        'SKU': v.sku,
        'Variant SKU': v.sku,
        'Option1 Value': v.option1,
        'Color': v.option1,
        'Price': v.price,
        'Variant Price': v.price,
        'Compare At Price': v.compareAtPrice,
        'Inventory': v.inventory,
        'Variant Inventory Qty': v.inventory,
        'Image Src': p.mainImage,
        'Variant Image': v.image,
        'Image': v.image || p.mainImage
      });
    });
  });
  return rows;
};

export const processRawRows = (rows: DataRow[], priceType?: string): Product[] => {
  const productMap: Record<string, Product> = {};

  // Helper: Encuentra el valor de una columna buscando por varias posibles claves (insensible a mayúsculas/símbolos)
  const getValue = (row: DataRow, possibleKeys: string[]): string => {
    const rowKeys = Object.keys(row);
    
    for (const key of possibleKeys) {
      // 1. Intento exacto
      if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
        return String(row[key]).trim();
      }
      
      // 2. Intento normalizado (sin espacios, sin guiones, minúsculas)
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      const foundRowKey = rowKeys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedKey);
      
      if (foundRowKey && row[foundRowKey] !== undefined && row[foundRowKey] !== null && String(row[foundRowKey]).trim() !== '') {
        return String(row[foundRowKey]).trim();
      }
    }
    return '';
  };

  const getPrice = (row: DataRow, type: string | undefined): number => {
    let priceVal: any;
    
    if (type) {
      const normalizedType = type.trim().toUpperCase();
      const rowKeys = Object.keys(row);
      // Intentar encontrar la columna exacta ignorando espacios y mayúsculas
      const foundKey = rowKeys.find(k => k.trim().toUpperCase() === normalizedType);
      if (foundKey) {
        priceVal = row[foundKey];
      }
    }
    
    if (priceVal === undefined || priceVal === null || String(priceVal).trim() === '') {
       // Fallback to standard price columns
       const priceStr = getValue(row, ['Price', 'Variant Price', 'Precio']);
       return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
    }

    return parseFloat(String(priceVal).replace(/[^0-9.]/g, '')) || 0;
  };

  rows.forEach((row) => {
    // 1. Identificar Producto (Handle)
    const handle = getValue(row, ['Handle', 'ID', 'Product Handle']);
    if (!handle) return; // Fila inválida si no tiene handle

    // 2. Extraer Datos con Prioridad
    // Prioridad de Imagen: Variant Image (Específica) > Image Src (Estándar) > Image (Genérica)
    const image = getValue(row, ['Variant Image', 'Image Src', 'Image', 'Imagen', 'Photo']);
    
    const price = getPrice(row, priceType);
    
    let comparePriceStr = getValue(row, ['TD', 'Precio TD', 'TD Price']);
    let comparePrice = comparePriceStr ? parseFloat(comparePriceStr.replace(/[^0-9.]/g, '')) : undefined;
    
    if (!comparePriceStr) {
      comparePriceStr = getValue(row, ['Compare At Price', 'Compare Price', 'Variant Price', 'Price', 'Precio']);
      comparePrice = comparePriceStr ? parseFloat(comparePriceStr.replace(/[^0-9.]/g, '')) : undefined;
    }
    
    const inventoryStr = getValue(row, ['Inventory', 'Variant Inventory Qty', 'Stock', 'Qty']);
    const inventory = parseInt(inventoryStr, 10) || 0;

    let color = getValue(row, ['Option1 Value', 'Color', 'Colour', 'Option1', 'Variante']);
    // Filtro para eliminar "Default" o "Default Title" (común en exports de Shopify)
    if (!color || color.toLowerCase() === 'default' || color.toLowerCase() === 'default title') {
      color = 'Único';
    }

    // Generar SKU por defecto si no existe
    const defaultSku = `${handle}-${color.replace(/\s+/g, '')}`; 
    const sku = getValue(row, ['SKU', 'Variant SKU', 'Part Number']) || defaultSku;

    const title = getValue(row, ['Title', 'Product Name', 'Nombre']) || handle;
    const type = getValue(row, ['Type', 'Product Type', 'Category', 'Categoria']) || 'General';
    const description = getValue(row, ['Body (HTML)', 'Description', 'Descripción']) || '';
    const tags = getValue(row, ['Tags', 'Etiquetas']);
    const vendor = getValue(row, ['Vendor', 'Marca']) || 'Cubitt';

    // 3. Crear o Actualizar Producto Padre
    if (!productMap[handle]) {
      productMap[handle] = {
        id: handle,
        handle: handle,
        title: title.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), // Formato Título
        description: description,
        vendor: vendor,
        category: type,
        type: type,
        mainImage: image, // Se intentará llenar con la primera imagen encontrada
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        variants: [],
        isOutOfStock: false,
        isBestSeller: tags.toLowerCase().includes('best seller'),
        isSale: tags.toLowerCase().includes('sale') || !!comparePrice,
      };
    }

    // 4. Gestionar Variantes
    const product = productMap[handle];
    const existingVariant = product.variants.find(v => v.sku === sku);

    if (!existingVariant) {
      // Nueva variante
      product.variants.push({
        sku: sku,
        option1: color,
        price: price,
        compareAtPrice: comparePrice,
        inventory: inventory,
        image: image || product.mainImage // Si la variante no tiene imagen propia, usa la del padre (temporalmente)
      });
    } else {
      // Variante existente: Actualizar imagen si la fila actual tiene una mejor (ej. Variant Image específica)
      if (!existingVariant.image && image) {
        existingVariant.image = image;
      }
    }
  });

  // 5. Post-procesamiento y Limpieza
  return Object.values(productMap).map(product => {
    // Lógica para seleccionar una imagen "variada" (no siempre la negra/primera)
    // Preferir imágenes de variantes que no sean colores neutros si es posible
    const variantsWithImages = product.variants.filter(v => v.image);
    
    if (variantsWithImages.length > 0) {
      // Intentar encontrar una variante que no sea negra/blanca/gris
      const colorfulVariant = variantsWithImages.find(v => {
        const color = v.option1.toLowerCase();
        return !['black', 'negro', 'white', 'blanco', 'grey', 'gray', 'gris', 'plata', 'silver'].some(c => color.includes(c));
      });

      // Si encontramos una colorida, la usamos como principal. Si no, usamos la primera disponible.
      // Esto sobreescribe la imagen del padre si se encontró una mejor opción.
      if (colorfulVariant) {
        product.mainImage = colorfulVariant.image;
      } else if (!product.mainImage) {
        product.mainImage = variantsWithImages[0].image;
      }
    }
    
    // Asegurar que todas las variantes tengan al menos la imagen del padre si les falta la suya
    product.variants.forEach(v => {
      if (!v.image) v.image = product.mainImage;
    });

    const totalStock = product.variants.reduce((acc, v) => acc + v.inventory, 0);
    
    return {
      ...product,
      isOutOfStock: totalStock <= 0,
      restockingSoon: totalStock <= 10 && totalStock > 0
    };
  });
};

export const fetchClientPriceType = async (companyName: string): Promise<string | null> => {
  if (!isSupabaseConfigured || !companyName.trim()) {
    return null;
  }
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('Tipo_precio')
      .ilike('Empresa', companyName.trim())
      .limit(1);

    if (error || !data || data.length === 0) return null;
    return data[0].Tipo_precio;
  } catch (err) {
    console.warn("Supabase fetchClientPriceType warning:", err);
    return null;
  }
};

export const fetchRawProducts = async (): Promise<DataRow[]> => {
  if (!isSupabaseConfigured) {
    return getFallbackRawProducts();
  }

  try {
    const { data: products, error } = await supabase
      .from('productos')
      .select('*')
      .range(0, 10000);

    if (error) {
      console.warn("fetchRawProducts query warning (falling back to default catalog):", error.message || error);
      return getFallbackRawProducts();
    }
    if (!products || products.length === 0) {
      return getFallbackRawProducts();
    }

    // Filtrar productos con inventario disponible
    const validRows = products.filter((p: any) => {
       const qty = parseInt(p['Variant Inventory Qty'] || p['Inventory'] || '0', 10);
       return qty > 0;
    });

    return validRows.length > 0 ? validRows : getFallbackRawProducts();
  } catch (err) {
    console.warn("Supabase fetch network error, using local fallback catalog:", err);
    return getFallbackRawProducts();
  }
};

export const fetchProductsFromSupabase = async (priceType?: string): Promise<Product[]> => {
  try {
    const rawRows = await fetchRawProducts();
    const processed = processRawRows(rawRows, priceType || undefined);
    return processed.length > 0 ? processed : PRODUCTS;
  } catch (err) {
    console.warn("Error in fetchProductsFromSupabase, returning local catalog:", err);
    return PRODUCTS;
  }
};


export const parseCSVToProducts = (csvText: string): Promise<Product[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          resolve(processRawRows(results.data as DataRow[]));
        } catch (e) {
          reject(e);
        }
      },
      error: (error: any) => reject(error)
    });
  });
};

export const parseExcelToProducts = (arrayBuffer: ArrayBuffer): Product[] => {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  // SheetJS extrae valores de celda. Las imágenes deben venir como URLs en columnas como 'Image Src' o 'Variant Image'.
  const rows = XLSX.utils.sheet_to_json(worksheet);
  return processRawRows(rows as DataRow[]);
};

export const fetchProductsFromUrl = async (url: string): Promise<Product[]> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al descargar el archivo');
    const text = await response.text();
    return parseCSVToProducts(text);
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
