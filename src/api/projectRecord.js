import request from '@/utils/request'

export function add(data) {
 
  return request({
    url: 'api/projectAccessRecord',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/projectAccessRecord',
    method: 'delete',
    data: ids
  })
}
export function getPartnerList(data){
  return request({
    url: 'api/projectAccessRecord',
    method: 'get',
    data
  })
}
export function resetUserPwd(ids){
  return request({
    url: 'api/projectAccessRecord',
    method: 'post',
    data:ids
  })
}

export default { add }
