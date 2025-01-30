import { Chip } from "@mui/material";

const StatusLabel = ({ status }: { status: string }) => {

  const getChipProps = () => {
    switch (status) {
      case 'pending':
        return {
          label: 'รอชำระ',
          color: 'warning' as const,
          icon: <i className="tabler-clock" />
        };
      case 'success':
        return {
          label: 'ชำระแล้ว',
          color: 'success' as const,
          icon: <i className="tabler-check" />
        };
      case 'cancelled':
        return {
          label: 'ยกเลิก',
          color: 'error' as const,
          icon: <i className="tabler-x" />
        };
      default:
        return {
          label: status,
          color: 'default' as const
        };
    }
  };

  return <Chip {...getChipProps()} />;
};

export default StatusLabel
