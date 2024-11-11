import { TIME_IN_MS } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useDolarExangeRate({ enabled = false } = {}) {
  const getDolarExangeRate = async () => {
    try {
      const { data } = await axios.get('https://api.bluelytics.com.ar/v2/latest');
      return data.blue.value_avg;
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
