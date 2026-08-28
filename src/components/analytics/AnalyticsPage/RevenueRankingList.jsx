import { OverflowWrapper } from "@/common/components/custom";
import { getFormatedPrice } from "@/common/utils";
import {
  BarFill,
  BarTrack,
  RankedAmount,
  RankedItem,
  RankedList,
  RankedMeta,
  RankedName,
} from "./styles";

const RevenueRankingList = ({ items = [], getKey, getName, getMeta }) => {
  const maxRevenue = Math.max(1, ...items.map(({ revenue }) => revenue));

  return (
    <RankedList>
      {items.map((item, index) => {
        const name = getName(item);
        const meta = getMeta?.(item);

        return (
          <RankedItem key={getKey(item, index)}>
            <div>
              <RankedName>
                <OverflowWrapper maxWidth="100%" popupContent={name}>
                  {name}
                </OverflowWrapper>
              </RankedName>
              {meta && <RankedMeta>{meta}</RankedMeta>}
            </div>
            <RankedAmount>{getFormatedPrice(item.revenue)}</RankedAmount>
            <BarTrack>
              <BarFill $width={(item.revenue / maxRevenue) * 100} />
            </BarTrack>
          </RankedItem>
        );
      })}
    </RankedList>
  );
};

export default RevenueRankingList;
