// Next Imports

import { notFound } from "next/navigation";

import actionGetStoreConfig from "@/actions/backend/setting/getStoreConfig";
import MainStore from "@/components/store/MainStore";


export default async function Page() {



  const config = await actionGetStoreConfig();

  if (!config) {
    notFound();
  }

  return (
    <>
      <div className='w-full max-w-[430px] min-h-screen overflow-y-auto mx-auto bg-white border-[#eee] border-[1px]'>
        <MainStore
          priceId='store'
          liffId={config.lineLogin.LINE_LIFF_ID}

        />
      </div>

    </>
  )
}

