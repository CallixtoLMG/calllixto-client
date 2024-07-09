import { TIME_IN_MS } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useDolarExangeRate({ enabled = false } = {}) {
  const getDolarExangeRate = async () => {
    try {
      const { data } = await axios.get('https://dolarapi.com/v1/dolares/blue');
      const { compra, venta } = data;
      return (compra + venta) / 2;
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: ['dolar'],
    queryFn: () => getDolarExangeRate(),
    staleTime: TIME_IN_MS.FIVE_MINUTES,
    enabled,
  });

  return query;
}
