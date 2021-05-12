import request from '@/utils/request'
import qs from 'qs'

export function searchQuestion(params) {
  return request({
    url: '/api/projectQuestion'+ '?' + qs.stringify(params, { indices: false }),
    method: 'get',
  })
}

export function ToProjectAnswer(params) {
  return request({
    url: 'api/projectAnswer',
    method: 'post',
    data: params
  })
}
export default { searchQuestion,ToProjectAnswer }
