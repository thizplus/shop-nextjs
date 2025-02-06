import { useState } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'


import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';

import Alert from '@mui/material/Alert'

import type { TypePriceList } from '@/types/priceListTypes'
import { useUpdatePriceName } from '@/actions/backend/priceList/useUpdatePriceName'

type Props = {
  items: TypePriceList
}

const BtnEditName = ({ items }: Props) => {
  const [open, setOpen] = useState(false)
  const [priceName, setPriceName] = useState(items.priceName)
  const { updatePriceName, isUpdating, error } = useUpdatePriceName()

  const handleUpdate = async () => {
    updatePriceName(
      { priceId: items.priceId, priceName: priceName.trim() },
      {
        onSuccess: () => setOpen(false)
      }
    )
  }

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <DriveFileRenameOutlineIcon className="text-[24px]" />
      </IconButton>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>แก้ไขชื่อราคา</DialogTitle>
        <DialogContent>
          <TextField
            label="ชื่อราคา"
            value={priceName}
            onChange={e => setPriceName(e.target.value)}
            fullWidth
            margin="dense"
          />
          {error && (
            <Alert severity="error" className="mt-2">
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
          <Button onClick={() => setOpen(false)} color="error">
            ยกเลิก
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default BtnEditName
