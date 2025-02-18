'use client'

import { useEffect, useState } from 'react'
import type { SyntheticEvent } from 'react'

import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import type { SelectChangeEvent } from '@mui/material/Select';
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import { useQueryClient } from '@tanstack/react-query'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'


import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import useStoreConfig from '@/actions/backend/setting/useStoreConfig'
import usePriceAll from '@/actions/backend/price/usePriceAll'
import type { StoreConfig, ListPrice, SlipOKConfig, LineMessageConfig, DisplayConfig, TelegramNotificationConfig } from '@/types/storeConfigTypes'
import actionUpdateConfig from '@/actions/backend/setting/updateStoreConfig'
import { formatNumber } from '@/components/global/functions/numberFormat'
import type { TypePriceList } from '@/types/priceListTypes'
import FileUpload from './fileUpload'
import SliderSection from './SliderSection'
import ColorPickerButton from './ColorPickerButton'
import TickerSettings from './TickerSettings'


const MainSetting = () => {
  const queryClient = useQueryClient();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [value, setValue] = useState<string>('1');
  const { data: storeConfig, status: configStatus, error: configError } = useStoreConfig();
  const { data: priceData, status: priceStatus, error: priceError } = usePriceAll(1, 100);
  const [config, setConfig] = useState<StoreConfig | undefined>(undefined);
  const [isProcess, setIsProcess] = useState<boolean>(false);
  const [qrFile, setQrFile] = useState<File | null>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [sliderFiles, setSliderFiles] = useState<File[]>([]);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (storeConfig) {
      setConfig(storeConfig);
    }
  }, [storeConfig]);

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const handleInputChange = (field: keyof StoreConfig, value: any) => {
    if (!config) return;

    setConfig({
      ...config,
      [field]: {
        ...config[field],
        ...value,
      },
    });
  };

  const handleTelegramNotificationChange = (field: keyof TelegramNotificationConfig, value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      telegramNotification: {
        ...config.telegramNotification,
        [field]: value,
      },
    });
  };

  const handleLineMessageChange = (field: keyof LineMessageConfig, value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      lineMessage: {
        ...config.lineMessage,
        [field]: value,
      },
    });
  };

  const handleSlipOKChange = (field: keyof SlipOKConfig, value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      slipOK: {
        ...config.slipOK,
        [field]: value,
      },
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleUpdate = async () => {
    if (!config) return;

    setIsProcess(true);

    // เพิ่ม log เพื่อดูค่า config ทั้งหมด
    console.log('Current config state:', {
      fullConfig: config,
      displayConfig: config.displayConfig,
      sliders: config.displayConfig.sliders,
      sliderFiles,
    });

    const updatedConfig = {
      ...config,
      saleModel: {
        ...config.saleModel,
        minOrderStatus: config.saleModel.minOrderStatus ?? false,
        minOrderValue: config.saleModel.minOrderValue ?? 0,
      },
      displayConfig: {
        ...config.displayConfig,

        // ทำให้แน่ใจว่า sliders array ไม่เป็น undefined
        sliders: config.displayConfig.sliders || [],
        tickers: config.tickers || [] // เพิ่มส่วนนี้
      }
    };

    try {
      const result = await actionUpdateConfig({
        config: updatedConfig,
        qrFile,
        logoFile,
        sliderFiles
      });

      console.log('Update successful:', {
        resultSliders: result.displayConfig?.sliders
      });

      setSnackbar({
        open: true,
        message: 'Configuration updated successfully',
        severity: 'success'
      });

      // รอให้ข้อมูลถูกบันทึกเสร็จก่อนจึงค่อย invalidate
      await new Promise(resolve => setTimeout(resolve, 100));

      // Invalidate and wait for new data
      await queryClient.invalidateQueries({ queryKey: ['StoreConfig'] });

      // รีเซ็ต sliderFiles หลังจากอัพเดทสำเร็จ
      setSliderFiles([]);

    } catch (error) {
      console.error('Error in handleUpdate:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to update configuration',
        severity: 'error'
      });
    } finally {
      setIsProcess(false);
    }
  };

  const handleSaleModelTypeChange = (event: SelectChangeEvent<'single' | 'multiple'>) => {
    const newType = event.target.value as 'single' | 'multiple';

    if (config) {
      setConfig({
        ...config,
        saleModel: {
          ...config.saleModel,
          type: newType,
          listPrice: newType === 'single' ? [{ id: '', name: '', minPurchase: 0, LIFF_ID: '' }] : []
        }
      });
    }
  };

  const handleAddPrice = () => {
    if (config && config.saleModel.type === 'multiple') {
      const newPrice: ListPrice = { id: '', name: '', minPurchase: 0, LIFF_ID: '' };

      setConfig({
        ...config,
        saleModel: {
          ...config.saleModel,
          listPrice: [...config.saleModel.listPrice, newPrice]
        }
      });
    }
  };

  const handleRemovePrice = (index: number) => {
    if (config && config.saleModel.type === 'multiple') {
      const newPrices = config.saleModel.listPrice.filter((_, i) => i !== index);

      setConfig({
        ...config,
        saleModel: {
          ...config.saleModel,
          listPrice: newPrices
        }
      });
    }
  };

  const handlePriceChange = (index: number, field: keyof ListPrice, value: any) => {
    if (!config || !priceData) return;

    const newPrices = [...config.saleModel.listPrice];

    if (field === 'id') {
      const selectedPrice = priceData.items.find((price: TypePriceList) => price.priceId === value);

      newPrices[index] = {
        ...newPrices[index],
        id: value,
        name: selectedPrice ? selectedPrice.priceName : ''
      };
    } else {
      newPrices[index] = {
        ...newPrices[index],
        [field]: Array.isArray(value) ? value : value
      };
    }

    setConfig({
      ...config,
      saleModel: {
        ...config.saleModel,
        listPrice: newPrices
      }
    });
  };

  const handleSaleModelChange = (field: keyof StoreConfig['saleModel'], value: any) => {
    if (!config) return;

    setConfig({
      ...config,
      saleModel: {
        ...config.saleModel,
        [field]: value,
      },
    });
  };



  // ใน MainSetting component เพิ่ม function handlers
  const handleDisplayConfigChange = (field: keyof DisplayConfig, value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      displayConfig: {
        ...config.displayConfig,
        [field]: value,
      },
    });
  };

  const handleLogoUpload = (file: File | null) => {
    setLogoFile(file);
  };

  const handleAddSlider = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!config || !event.target.files) return;

    const filesArray = Array.from(event.target.files);

    setSliderFiles(filesArray);

    const previewUrls = filesArray.map(file => URL.createObjectURL(file));

    const newSliders = filesArray.map((_, index) => ({
      id: `temp-${Date.now()}-${index}`,
      url: previewUrls[index],
      isTemp: true
    }));

    setConfig({
      ...config,
      displayConfig: {
        ...config.displayConfig,
        sliders: [...config.displayConfig.sliders, ...newSliders]
      }
    });
  };

  const handleRemoveSlider = async (id: string) => {
    if (!config) return;

    // Log ก่อนลบ
    console.log('Before removing slider:', {
      id,
      currentSliders: config.displayConfig.sliders,
      sliderFilesCount: sliderFiles.length
    });

    // หา index ของ slider ที่จะลบ
    const sliderIndex = config.displayConfig.sliders.findIndex(
      slider => slider.id === id
    );

    // สร้าง sliders array ใหม่โดยไม่รวม slider ที่ต้องการลบ
    const newSliders = config.displayConfig.sliders.filter(slider => slider.id !== id);

    // อัพเดท config ด้วย sliders ใหม่
    setConfig({
      ...config,
      displayConfig: {
        ...config.displayConfig,
        sliders: newSliders
      }
    });

    // อัพเดท sliderFiles โดยลบไฟล์ที่ตำแหน่งเดียวกับ slider ที่ถูกลบ
    if (sliderIndex !== -1 && sliderFiles.length > 0) {
      const newSliderFiles = sliderFiles.filter((_, index) => index !== sliderIndex);

      setSliderFiles(newSliderFiles);
    }

    // เรียก handleUpdate เพื่อบันทึกการเปลี่ยนแปลง
    // await handleUpdate();
  };




  if (configStatus === 'pending' || priceStatus === 'pending') {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (configStatus === 'error' || priceStatus === 'error') {
    return (
      <div className="text-center text-red-500">
        <p>An error occurred while loading the data.</p>
        <p>{configError instanceof Error ? configError.message : 'Unknown error'}</p>
        <p>{priceError instanceof Error ? priceError.message : 'Unknown error'}</p>
      </div>
    );
  }

  if (!config || !priceData) {
    return <div className="text-center">No data found.</div>;
  }

  return (
    <>

      {isMobile ? (

        <div className="space-y-2">
          {/* LINE LOGIN */}
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
            >
              <Typography>LINE LOGIN</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="h6" className='mb-4'>LINE LOGIN Configuration</Typography>
              <TextField
                label="LINE LIFF ID"
                variant="outlined"
                fullWidth
                className='mb-4'
                size="small"
                value={config.lineLogin?.LINE_LIFF_ID || ''}
                onChange={(e) => handleInputChange('lineLogin', { LINE_LIFF_ID: e.target.value })}
              />
            </AccordionDetails>
          </Accordion>

          {/* TELEGRAM NOTIFICATION */}
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
            >
              <Typography>TELEGRAM NOTIFICATION</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="h6" className='mb-4'>TELEGRAM Configuration</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.telegramNotification?.TELEGRAM_ENABLED || false}
                    onChange={(e) => handleTelegramNotificationChange('TELEGRAM_ENABLED', e.target.checked)}
                    color="primary"
                  />
                }
                label="เปิดใช้งานการแจ้งเตือน TELEGRAM"
                className='mb-4'
              />
              <TextField
                label="TELEGRAM BOT TOKEN"
                variant="outlined"
                fullWidth
                size="small"
                value={config.telegramNotification?.TELEGRAM_BOT_TOKEN || ''}
                onChange={(e) => handleTelegramNotificationChange('TELEGRAM_BOT_TOKEN', e.target.value)}
                disabled={!config.telegramNotification?.TELEGRAM_ENABLED}
                className='mb-4'
              />
              <TextField
                label="TELEGRAM CHAT ID"
                variant="outlined"
                fullWidth
                size="small"
                value={config.telegramNotification?.TELEGRAM_CHAT_ID || ''}
                onChange={(e) => handleTelegramNotificationChange('TELEGRAM_CHAT_ID', e.target.value)}
                disabled={!config.telegramNotification?.TELEGRAM_ENABLED}
              />
            </AccordionDetails>
          </Accordion>

          {/* LINE MESSAGE */}
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
            >
              <Typography>LINE MESSAGE</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="h6" className='mb-4'>LINE Messaging API Configuration</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.lineMessage?.MESSAGE_ENABLED || false}
                    onChange={(e) => handleLineMessageChange('MESSAGE_ENABLED', e.target.checked)}
                    color="primary"
                  />
                }
                label="เปิดใช้งาน LINE Messaging API"
                className='mb-4'
              />
              <TextField
                label="Channel Access Token"
                variant="outlined"
                fullWidth
                size="small"
                className='mb-4'
                value={config.lineMessage?.CHANNEL_ACCESS_TOKEN || ''}
                onChange={(e) => handleLineMessageChange('CHANNEL_ACCESS_TOKEN', e.target.value)}
                disabled={!config.lineMessage?.MESSAGE_ENABLED}
              />
              <TextField
                label="Channel Secret"
                variant="outlined"
                fullWidth
                size="small"
                value={config.lineMessage?.CHANNEL_SECRET || ''}
                onChange={(e) => handleLineMessageChange('CHANNEL_SECRET', e.target.value)}
                disabled={!config.lineMessage?.MESSAGE_ENABLED}
              />
            </AccordionDetails>
          </Accordion>

          {/* SLIP OK */}
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
            >
              <Typography>SLIP OK</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="h6" className='mb-4'>Slip OK API Configuration</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.slipOK?.ENABLED || false}
                    onChange={(e) => handleSlipOKChange('ENABLED', e.target.checked)}
                    color="primary"
                  />
                }
                label="เปิดใช้งาน Slip OK API"
                className='mb-4'
              />
              <div className="mb-4">
                <Typography variant="subtitle2" className="mb-2">QR Code Image</Typography>
                <FileUpload
                  onFileSelected={setQrFile}
                  currentImageUrl={config.slipOK?.qr_image}
                  height={250}
                  placeholderText="แนบภาพ QR สำหรับให้ลูกค้าโอนเงินที่นี่..."
                />
              </div>
              <TextField
                label="API URL"
                variant="outlined"
                fullWidth
                size="small"
                className='mb-4'
                value={config.slipOK?.API_URL || ''}
                onChange={(e) => handleSlipOKChange('API_URL', e.target.value)}
                disabled={!config.slipOK?.ENABLED}
              />
              <TextField
                label="API Key"
                variant="outlined"
                fullWidth
                size="small"
                value={config.slipOK?.API_KEY || ''}
                onChange={(e) => handleSlipOKChange('API_KEY', e.target.value)}
                disabled={!config.slipOK?.ENABLED}
              />
            </AccordionDetails>
          </Accordion>

          {/* รูปแบบการขาย */}
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
            >
              <Typography>รูปแบบการขาย</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="h6" className='mb-4'>Sale Model Configuration</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.saleModel.minOrderStatus}
                    onChange={(e) => handleSaleModelChange('minOrderStatus', e.target.checked)}
                    color="primary"
                  />
                }
                label="เปิดใช้งานยอดสั่งซื้อขั้นต่ำ"
              />
              {config.saleModel.minOrderStatus && (
                <TextField
                  label="ยอดสั่งซื้อขั้นต่ำ"
                  variant="outlined"
                  type="number"
                  fullWidth
                  size="small"
                  className='mt-2'
                  value={config.saleModel.minOrderValue}
                  onChange={(e) => handleSaleModelChange('minOrderValue', Number(e.target.value))}
                />
              )}
              {/* ส่วนของการตั้งค่าราคาอื่นๆ */}
            </AccordionDetails>
          </Accordion>

          {/* ค่าจัดส่ง */}
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
            >
              <Typography>ค่าจัดส่ง</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="h6" className='mb-4'>Shipping Cost Configuration</Typography>
              <TextField
                label="เมื่อสั่งซื้อต่ำกว่าหรือเท่ากับ"
                variant="outlined"
                type="number"
                fullWidth
                size="small"
                className='mb-4'
                value={config.shippingCost?.standard.value ?? 0}
                onChange={(e) => handleInputChange('shippingCost', { standard: { ...config.shippingCost?.standard, value: Number(e.target.value) } })}
              />
              {/* ส่วนของการตั้งค่าการจัดส่งอื่นๆ */}
            </AccordionDetails>
          </Accordion>

          {/* การแสดงผล */}
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
            >
              <Typography>การแสดงผล</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="h6" className="mb-4">ตั้งค่าการแสดงผล</Typography>
              <div className="mb-6 max-w-[250px]">
                <Typography variant="subtitle1" className="mb-2">โลโก้ร้าน</Typography>
                <FileUpload
                  onFileSelected={handleLogoUpload}
                  currentImageUrl={config.displayConfig.logo}
                  height={200}
                  placeholderText="อัพโหลดโลโก้ร้านของคุณที่นี่..."
                />
              </div>
              {/* ส่วนของการตั้งค่าการแสดงผลอื่นๆ */}
            </AccordionDetails>
          </Accordion>

          {/* อักษรวิ่ง */}
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
            >
              <Typography>อักษรวิ่ง</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TickerSettings
                tickers={config.tickers || []}
                onUpdate={(newTickers) => {
                  setConfig({
                    ...config,
                    tickers: newTickers
                  });
                }}
              />
            </AccordionDetails>
          </Accordion>
        </div>
      ) : (

        <TabContext value={value}>
          <TabList onChange={handleChange} aria-label='store configuration tabs'>
            <Tab value='1' label='LINE LOGIN' />
            <Tab value='2' label='TELEGRAM NOTIFICATION' />
            <Tab value='3' label='LINE MESSAGE' />
            <Tab value='4' label='SLIP OK' />
            <Tab value='5' label='รูปแบบการขาย' />
            <Tab value='6' label='ค่าจัดส่ง' />
            <Tab value="7" label="การแสดงผล" />
            <Tab value="8" label="อักษรวิ่ง" />
          </TabList>

          {/* Line Login Config */}
          <TabPanel value='1' className='max-w-xs'>
            <Typography variant="h6" className='mb-4'>LINE LOGIN Configuration</Typography>


            <TextField
              label="LINE LIFF ID"
              variant="outlined"
              fullWidth
              className='mb-4'
              size="small"
              value={config.lineLogin?.LINE_LIFF_ID || ''}
              onChange={(e) => handleInputChange('lineLogin', { LINE_LIFF_ID: e.target.value })}
            />


          </TabPanel>

          {/* Line Notification */}
          <TabPanel value='2' className='max-w-xs'>
            <Typography variant="h6" className='mb-4'>TELEGRAM Configuration</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={config.telegramNotification?.TELEGRAM_ENABLED || false}
                  onChange={(e) => handleTelegramNotificationChange('TELEGRAM_ENABLED', e.target.checked)}
                  color="primary"
                />
              }
              label="เปิดใช้งานการแจ้งเตือน TELEGRAM"
              className='mb-4'
            />
            <TextField
              label="TELEGRAM BOT TOKEN"
              variant="outlined"
              fullWidth
              size="small"
              value={config.telegramNotification?.TELEGRAM_BOT_TOKEN || ''}
              onChange={(e) => handleTelegramNotificationChange('TELEGRAM_BOT_TOKEN', e.target.value)}
              disabled={!config.telegramNotification?.TELEGRAM_ENABLED}
              className='mb-4'
            />

            <TextField
              label="TELEGRAM CHAT ID"
              variant="outlined"
              fullWidth
              size="small"
              value={config.telegramNotification?.TELEGRAM_CHAT_ID || ''}
              onChange={(e) => handleTelegramNotificationChange('TELEGRAM_CHAT_ID', e.target.value)}
              disabled={!config.telegramNotification?.TELEGRAM_ENABLED}
            />

          </TabPanel>

          {/* Line Message Config */}
          <TabPanel value='3' className='max-w-xs'>
            <Typography variant="h6" className='mb-4'>LINE Messaging API Configuration</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={config.lineMessage?.MESSAGE_ENABLED || false}
                  onChange={(e) => handleLineMessageChange('MESSAGE_ENABLED', e.target.checked)}
                  color="primary"
                />
              }
              label="เปิดใช้งาน LINE Messaging API"
              className='mb-4'
            />
            <TextField
              label="Channel Access Token"
              variant="outlined"
              fullWidth
              size="small"
              className='mb-4'
              value={config.lineMessage?.CHANNEL_ACCESS_TOKEN || ''}
              onChange={(e) => handleLineMessageChange('CHANNEL_ACCESS_TOKEN', e.target.value)}
              disabled={!config.lineMessage?.MESSAGE_ENABLED}
            />
            <TextField
              label="Channel Secret"
              variant="outlined"
              fullWidth
              size="small"
              value={config.lineMessage?.CHANNEL_SECRET || ''}
              onChange={(e) => handleLineMessageChange('CHANNEL_SECRET', e.target.value)}
              disabled={!config.lineMessage?.MESSAGE_ENABLED}
            />
          </TabPanel>

          {/* SlipOK Config */}
          <TabPanel value='4' className='max-w-xs'>
            <Typography variant="h6" className='mb-4'>Slip OK API Configuration</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={config.slipOK?.ENABLED || false}
                  onChange={(e) => handleSlipOKChange('ENABLED', e.target.checked)}
                  color="primary"
                />
              }
              label="เปิดใช้งาน Slip OK API"
              className='mb-4'
            />

            <div className="mb-4">
              <Typography variant="subtitle2" className="mb-2">QR Code Image</Typography>
              <FileUpload
                onFileSelected={setQrFile}
                currentImageUrl={config.slipOK?.qr_image}
                height={250}
                placeholderText="แนบภาพ QR สำหรับให้ลูกค้าโอนเงินที่นี่..."
              />
            </div>

            <TextField
              label="API URL"
              variant="outlined"
              fullWidth
              size="small"
              className='mb-4'
              value={config.slipOK?.API_URL || ''}
              onChange={(e) => handleSlipOKChange('API_URL', e.target.value)}
              disabled={!config.slipOK?.ENABLED}
            />
            <TextField
              label="API Key"
              variant="outlined"
              fullWidth
              size="small"
              value={config.slipOK?.API_KEY || ''}
              onChange={(e) => handleSlipOKChange('API_KEY', e.target.value)}
              disabled={!config.slipOK?.ENABLED}
            />
          </TabPanel>

          {/* Sale Model Config */}
          <TabPanel value='5' className='max-w-xs'>
            <Typography variant="h6" className='mb-4'>Sale Model Configuration</Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={config.saleModel.minOrderStatus}
                  onChange={(e) => handleSaleModelChange('minOrderStatus', e.target.checked)}
                  color="primary"
                />
              }
              label="เปิดใช้งานยอดสั่งซื้อขั้นต่ำ"
              className=''
            />
            {config.saleModel.minOrderStatus && (
              <TextField
                label="ยอดสั่งซื้อขั้นต่ำ"
                variant="outlined"
                type="number"
                fullWidth
                size="small"
                className='mt-2'
                value={config.saleModel.minOrderValue}
                onChange={(e) => handleSaleModelChange('minOrderValue', Number(e.target.value))}
              />
            )}

            <Select
              value={config.saleModel.type}
              onChange={handleSaleModelTypeChange}
              fullWidth
              size='small'
              className='my-4'
            >
              <MenuItem value="single">ราคาเดียว</MenuItem>
              <MenuItem value="multiple">หลายราคา</MenuItem>
            </Select>

            {config.saleModel.type === 'single' ? (
              <Select
                value={config.saleModel.listPrice[0]?.id || ''}
                onChange={(e) => handlePriceChange(0, 'id', e.target.value)}
                fullWidth
                size='small'
              >
                {priceData.items.map((price: TypePriceList) => (
                  <MenuItem key={price._id.toString()} value={price.priceId}>
                    {price.priceName}
                  </MenuItem>
                ))}
              </Select>
            ) : (
              <>
                {config.saleModel.listPrice.map((price, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <Select
                      value={price.id}
                      onChange={(e) => handlePriceChange(index, 'id', e.target.value)}
                      style={{ marginRight: '10px', flexGrow: 1 }}
                      size='small'
                    >
                      {priceData.items.map((priceItem: TypePriceList) => (
                        <MenuItem key={priceItem._id.toString()} value={priceItem.priceId}>
                          {priceItem.priceName}
                        </MenuItem>
                      ))}
                    </Select>
                    <TextField
                      label="ยอดซื้อขั้นต่ำ"
                      variant="outlined"
                      type="number"
                      size='small'
                      value={price.minPurchase}
                      onChange={(e) => handlePriceChange(index, 'minPurchase', Number(e.target.value))}
                      style={{ marginRight: '10px', width: '150px' }}
                    />
                    <IconButton onClick={() => handleRemovePrice(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </div>
                ))}
                <Button startIcon={<AddIcon />} onClick={handleAddPrice}>
                  เพิ่มราคา
                </Button>
              </>
            )}


          </TabPanel>

          {/* Shipping Cost Config */}
          <TabPanel value='6' className='max-w-sm'>
            <Typography variant="h6" className='mb-4'>Shipping Cost Configuration</Typography>
            <TextField
              label="เมื่อสั่งซื้อต่ำกว่าหรือเท่ากับ"
              variant="outlined"
              type="number"
              fullWidth
              size="small"
              className='mb-4'
              value={config.shippingCost?.standard.value ?? 0}
              onChange={(e) => handleInputChange('shippingCost', { standard: { ...config.shippingCost?.standard, value: Number(e.target.value) } })}
            />
            <TextField
              label="ค่าจัดส่งมาตรฐาน"
              variant="outlined"
              type="number"
              fullWidth
              size="small"
              className='mb-4'
              value={config.shippingCost?.standard.cost ?? 0}
              onChange={(e) => handleInputChange('shippingCost', { standard: { ...config.shippingCost?.standard, cost: Number(e.target.value) } })}
            />
            {config.shippingCost && (
              <TextField
                label={`หากมากกว่า ${formatNumber(config.shippingCost.standard.value)} = ราคาสินค้าทั้งหมด หารด้วย ${config.shippingCost.special.value}`}
                variant="outlined"
                type="number"
                fullWidth
                size="small"
                className='mb-4'
                value={config.shippingCost.special.value}
                onChange={(e) => handleInputChange('shippingCost', { special: { ...config.shippingCost.special, value: Number(e.target.value) } })}
              />
            )}
            {config.shippingCost && (
              <>
                <p className='text-sm'>ซื้อสินค้า 1 - {formatNumber(config.shippingCost.standard.value)}  : ค่าจัดส่ง = {config.shippingCost.standard.cost} บาท</p>
                <p className='text-sm'>ซื้อสินค้า {formatNumber(config.shippingCost.standard.value)} ขึ้นไป : ค่าจัดส่ง = ราคาสินค้าในตระกร้า / {config.shippingCost.special.value}</p>
                <p className='text-sm'>สมมุติซื้อสินค้า 10,000 บาท : ค่าจัดส่ง = {formatNumber(10000 / config.shippingCost.special.value)} บาท</p>
              </>
            )}
          </TabPanel>


          {/* Display Settings TabPanel */}
          <TabPanel value="7" className="max-w-xl">
            <Typography variant="h6" className="mb-4">ตั้งค่าการแสดงผล</Typography>


            <FormControlLabel
              control={
                <Switch
                  checked={config.displayConfig.isProtected}
                  onChange={(e) => handleDisplayConfigChange('isProtected', e.target.checked)}
                  color="primary"
                />
              }
              label="เปิดใช้งานระบบป้องกันหน้าเว็บไซต์"
            />
            {/* Logo Upload */}
            <div className="mb-6 max-w-[250px]">
              <Typography variant="subtitle1" className="mb-2">โลโก้ร้าน</Typography>
              <FileUpload
                onFileSelected={handleLogoUpload}
                currentImageUrl={config.displayConfig.logo}
                height={200}
                placeholderText="อัพโหลดโลโก้ร้านของคุณที่นี่..."
              />
            </div>

            {/* Slider Images */}
            <div className="mb-6">
              <Typography variant="subtitle1" className="mb-2">รูปภาพสไลด์</Typography>
              <SliderSection
                sliders={config.displayConfig.sliders}
                onRemove={handleRemoveSlider}
                onAdd={handleAddSlider}
              />
            </div>

            {/* Primary Color */}
            <div className="mb-6">
              <Typography variant="subtitle1" className="mb-2">เลือกสีของร้านค่า</Typography>
              <ColorPickerButton
                color={config.displayConfig.primaryColor}
                onChange={(color) => handleDisplayConfigChange('primaryColor', color)}
              />
            </div>

            <TextField
              label="ชื่อร้าน"
              variant="outlined"
              fullWidth
              size="small"
              className='mb-4'
              value={config.displayConfig.shopName || ''}
              onChange={(e) => handleDisplayConfigChange('shopName', e.target.value)}

            />

            <TextField
              label="สโลแกน"
              variant="outlined"
              fullWidth
              size="small"
              className='mb-4'
              value={config.displayConfig.shopSlogan || ''}
              onChange={(e) => handleDisplayConfigChange('shopSlogan', e.target.value)}

            />

          </TabPanel>


          {/* Tab Panels อื่นๆ */}
          <TabPanel value="8">
            <TickerSettings
              tickers={config.tickers || []}
              onUpdate={(newTickers) => {
                setConfig({
                  ...config,
                  tickers: newTickers
                });
              }}
            />
          </TabPanel>

        </TabContext >
      )}




      <Button
        onClick={handleUpdate}
        variant='contained'
        color='primary'
        className='mt-4'
        disabled={isProcess}
      >
        {isProcess ? 'กำลังบันทึกข้อมูล...' : 'บันทึกข้อมูล'}
      </Button>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            boxShadow: 3,
            borderRadius: 2
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MainSetting;
