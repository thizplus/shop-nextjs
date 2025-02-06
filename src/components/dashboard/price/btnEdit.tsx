import Link from "next/link";

import EditNoteIcon from '@mui/icons-material/EditNote';
import IconButton from "@mui/material/IconButton";

import type { TypePriceList } from "@/types/priceListTypes";

type propsLink = {
  items: TypePriceList;
}

const BtnEdit = ({ items }: propsLink) => {
  return (

    <IconButton aria-label="edit" >
      <Link className="flex" href={`/dashboard/price/${items.priceId}`}>
        <EditNoteIcon className="text-[30px]" />
      </Link>
    </IconButton>

  )
}

export default BtnEdit
