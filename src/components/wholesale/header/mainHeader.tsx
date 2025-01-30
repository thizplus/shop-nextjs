
import { useClientStores } from '@/stores/authStore'

//import { useAuth } from '@/actions/client/useAuth'

import TotalCart from './totalCart'
import { useConfigStore } from '@/stores/configStore'



type propsPriceInfo = {
  priceId: string
  priceName: string

}

const MainHeader = ({ priceId, priceName }: propsPriceInfo) => {
  const { isLoggedIn } = useClientStores()
  const { config } = useConfigStore();

  //const { handleLogout } = useAuth()

  return (
    <>
      <div className="p-4 fixed w-full bg-white shadow-md z-10 max-w-[430px]">
        <div className='flex gap-2 justify-between'>
          <div className="flex gap-2 leading-none">


            <div className="flex gap-2 leading-none">
              <img src={`${config?.displayConfig.logo}`} className='max-h-[44px]' />
              <div className='my-auto'>
                <p className='font-bold text-xl leading-none'>{`${config?.displayConfig.shopName}`}</p>
                <p className=' text-xs leading-none'>{`${config?.displayConfig.shopSlogan}`}</p>
                <p className=' text-xs leading-none'>{priceName} : {priceId} </p>
              </div>
            </div>





          </div>

          {isLoggedIn &&
            <TotalCart priceId={priceId} />
          }
        </div>
      </div>
      <div className="h-[80px]"></div>
    </>
  )
}

export default MainHeader
