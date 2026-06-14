import { format } from "date-fns";
import "./InfoHeader.css";

import { useMediaQuery } from "../hooks/useMediaQuery";

interface Props {
  location: string;
  startDate: Date;
  endDate: Date;
}

// Header that displays the rental specifications (location and date range).
export default function InfoHeader({ location, startDate, endDate }: Props) {
  const mobile = useMediaQuery("(max-width: 568px)");

  return (
    <div className="p-4 mt-5 mb-4 mx-4 info-header">
      <span className="mr-3">{location}</span>

      {mobile ? <br /> : "|"}

      <span className={"mr-2" + (mobile ? "" : " ml-3")}>
        {format(startDate, "M/d/yyyy")}
      </span>

      <span>to</span>

      <span className="ml-2">{format(endDate, "M/d/yyyy")}</span>
    </div>
  );
}
