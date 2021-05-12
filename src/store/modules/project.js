

const state = {
  projectStep:1
}

const mutations = {
  SET_PROJECTSTEP: (state, target) => {
    state.projectStep=target
  }
}

const actions = {
  updateStep({ commit }, target) {
    commit('SET_PROJECTSTEP', target)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

