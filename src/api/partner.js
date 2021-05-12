import request from '@/utils/request'

export function add(data) {
  data.currentType=data.userType==='0'?'1':'2'
  return request({
    url: 'api/projectPartner',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/projectPartner',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  data.currentType=data.userType==='0'?'1':'2'
  return request({
    url: 'api/projectPartner',
    method: 'put',
    data
  })
}
export function getPartnerList(data){
  return request({
    url: 'api/projectPartner',
    method: 'get',
    data
  })
}
export function resetUserPwd(ids){
  return request({
    url: 'api/projectPartner/resetPass',
    method: 'post',
    data:ids
  })
}
export function toChangePartnerStatus(param){
  return request({
    url: 'api/projectPartner/enableOrDisable',
    method: 'post',
    data:param
  })
}

export default { add, edit, del,resetUserPwd }
