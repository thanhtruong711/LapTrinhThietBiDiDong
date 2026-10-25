import type { Phone } from "../types";
import { COLOR_ORDER } from "../data/phones";

export const API_URL = "https://6addd01b4e88f1bba4a4b63d.mockapi.io";

export async function fetchPhone(id: string): Promise<Phone> {
  const res = await fetch(`${API_URL}/phone/${id}`);
  if (!res.ok) throw new Error(`Máy chủ trả về lỗi ${res.status}`);
  const data = await res.json();
  return {
    ...data,
    colors: data.colors?.length ? data.colors : COLOR_ORDER,
  } as Phone;
}