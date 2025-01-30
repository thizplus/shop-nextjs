import Link from "next/link";

import EditIcon from '@mui/icons-material/Edit';
import IconButton from "@mui/material/IconButton";

import type { TypePriceList } from "@/types/priceListTypes";

type propsLink = {
  items: TypePriceList;
}

const BtnEdit = ({ items }: propsLink) => {
  return (

    <IconButton aria-label="edit" >
      <Link className="flex" href={`/dashboard/price/${items._id}`}>
        <EditIcon />
      </Link>
    </IconButton>

  )
}

export default BtnEdit
