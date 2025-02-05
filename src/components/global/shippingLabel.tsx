import { Chip } from "@mui/material";

const ShippingLabel = ({ status }: { status: string }) => {

  const getChipProps = () => {
    switch (status) {

      case 'grab':
        return {
          label: 'GRAB',
          color: 'success' as const,
          icon: <i className="tabler-bike" />
        };

      default:
        return {
          label: 'KERRY',
          color: 'default' as const,
          icon: <i className="tabler-truck-delivery" />
        };
    }
  };

  return <Chip {...getChipProps()} />;
};

export default ShippingLabel
