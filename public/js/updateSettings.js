import axios from "axios"
import { showAlert } from './alerts'

export const updateSettings = async (data, type) => {
   try {
      const urlType = type === 'Password'
         ? 'updateMyPassword'
         : 'updateMe'

      const res = await axios({
         method: 'PATCH',
         url: `http://localhost:3000/api/v1/users/${urlType}`,
         data
      })

      if (res.data.status === 'success') {
         showAlert('success', `${type} updated successfully`)
      }
   } catch (err) {
      showAlert('error', err.response.data.message)
   }
}