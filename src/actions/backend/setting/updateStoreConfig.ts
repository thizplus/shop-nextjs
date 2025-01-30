import type { StoreConfig } from "@/types/storeConfigTypes";

type propsConfig = {
  config: StoreConfig;
  qrFile?: File | null;
  logoFile?: File | null;
  sliderFiles?: File[];
}

const actionUpdateConfig = async ({ config, qrFile, logoFile, sliderFiles }: propsConfig) => {
  try {
    // Log ข้อมูลที่จะส่ง
    console.log('Config data to be sent:', {
      config: {
        displayConfig: config.displayConfig,
        sliders: config.displayConfig?.sliders
      }
    });

    console.log('Files to be sent:', {
      hasQrFile: !!qrFile,
      hasLogoFile: !!logoFile,
      sliderFiles: {
        count: sliderFiles?.length || 0,
        files: sliderFiles?.map(f => f.name)
      }
    });

    const formData = new FormData();

    // แนบ config
    formData.append('config', JSON.stringify(config));

    // Log formData ก่อนแนบไฟล์
    console.log('FormData initial entries:');

    for (const pair of formData.entries()) {
      if (pair[0] === 'config') {
        console.log('config:', JSON.parse(pair[1] as string));
      } else {
        console.log(pair[0], pair[1]);
      }
    }

    // แนบ QR Image
    if (qrFile) {
      console.log('Appending qr_image:', qrFile.name);
      formData.append('qr_image', qrFile);
    }

    // แนบ logo
    if (logoFile) {
      console.log('Appending logo:', logoFile.name);
      formData.append('logo', logoFile);
    }

    // แนบ sliders
    if (sliderFiles?.length) {
      console.log('Appending sliders:', {
        count: sliderFiles.length,
        files: sliderFiles.map(f => f.name)
      });

      sliderFiles.forEach((file, index) => {
        formData.append('slider', file);
        console.log(`Appended slider ${index + 1}:`, file.name);
      });
    }

    // Log formData หลังแนบไฟล์ทั้งหมด
    console.log('Final FormData entries:');

    for (const pair of formData.entries()) {
      if (pair[0] === 'config') {
        console.log('config:', JSON.parse(pair[1] as string));
      } else {
        console.log(pair[0], typeof pair[1] === 'string' ? pair[1] : 'File:',
          pair[1] instanceof File ? {
            name: (pair[1] as File).name,
            size: (pair[1] as File).size,
            type: (pair[1] as File).type
          } : pair[1]
        );
      }
    }

    // ส่งข้อมูล
    console.log('Sending request to:', `${process.env.NEXT_PUBLIC_SERVER_URL}/api/store/config`);

    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/store/config`, {
      method: 'PUT',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error('Server responded with error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to update configuration: ${errorText}`);
    }

    const data = await response.json();

    console.log('Server response:', data);

    return data;

  } catch (error) {
    console.error('Error in actionUpdateConfig:', error);

    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }

    throw error;
  }
};

export default actionUpdateConfig;
