/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { getApiCDP, postApiCDP } from 'src/services/api';

export const inputList = {
  result: [
    {
      id: 'aaa81998-5e30-4b77-a968-7237f5df05a1',
      tenantId: 2,
      cdpTypeId: 'ed4a98e5-27da-4e75-a9bb-d3443763ae7c',
      userInput: {
        parameters: [
          {
            'A-frame Deadend': [
              {
                name: 'side_voltage',
                type: 'dropdown',
                user: true,
                label: 'What is the high side voltage',
                value: '',
                options: [
                  '69KV',
                  '115KV',
                  '138KV',
                  '161KV',
                  '230KV',
                  '345KV',
                  '500KV',
                ],
                isRequired: true,
              },
              {
                name: 'frame_diameter',
                type: 'text',
                user: true,
                group: 'A-frame Deadend',
                label: 'Diameter of foundation',
                value: '',
                isRequired: true,
              },
              {
                name: 'frame_depth',
                type: 'text',
                user: true,
                group: 'A-frame Deadend',
                label: 'Depth of foundation',
                value: '',
                isRequired: true,
              },
            ],
          },
          {
            Breakers: [
              {
                name: 'breaker_length',
                type: 'text',
                user: true,
                label: 'Length of foundation',
                value: '',
                isRequired: true,
              },
              {
                name: 'breaker_width',
                type: 'text',
                user: true,
                label: 'Width of foundation',
                value: '',
                isRequired: true,
              },
              {
                name: 'breaker_depth',
                type: 'text',
                user: true,
                label: 'Depth of foundation',
                value: '',
                isRequired: true,
              },
            ],
          },
          {
            Transformers: [
              {
                name: 'transformer_length',
                type: 'text',
                user: true,
                label: 'Length of foundation',
                value: '',
                isRequired: true,
              },
              {
                name: 'transformer_width',
                type: 'text',
                user: true,
                label: 'Width of foundation',
                value: '',
                isRequired: true,
              },
              {
                name: 'transformer_depth',
                type: 'text',
                user: true,
                label: 'Depth of foundation',
                value: '',
                isRequired: true,
              },
            ],
          },
          {
            'ABS (Air break switch)': [
              {
                name: 'abs_diameter',
                type: 'number',
                user: true,
                label: 'Diameter of foundation',
                value: '',
                isRequired: true,
              },
              {
                name: 'abs_depth',
                type: 'number',
                user: true,
                label: 'Depth of fonudation',
                value: '',
                isRequired: true,
              },
            ],
          },
          {
            'ABS (Air break switch)': [
              {
                name: 'abs_diameter',
                type: 'number',
                user: true,
                label: 'Diameter of foundation',
                value: '',
                isRequired: true,
              },
              {
                name: 'abs_depth',
                type: 'number',
                user: true,
                label: 'Depth of fonudation',
                value: '',
                isRequired: true,
              },
            ],
          },
          {
            'Linear switch': [
              {
                name: 'linear_switch_diameter',
                type: 'number',
                user: true,
                label: 'Diameter of foundation',
                value: '',
                isRequired: true,
              },
              {
                name: 'linear_switch_depth',
                type: 'number',
                user: true,
                label: 'Depth of fonudation',
                value: '',
                isRequired: true,
              },
            ],
          },
          {
            'Feeder structure': [
              {
                name: 'feeder_structure_diameter',
                type: 'number',
                user: true,
                label: 'Diameter of foundation',
                value: '',
                isRequired: true,
              },
              {
                name: 'feeder_structure_depth',
                type: 'number',
                user: true,
                label: 'Depth of fonudation',
                value: '',
                isRequired: true,
              },
            ],
          },
          {
            'Cap Bank': [
              {
                name: 'cap_bank',
                type: 'boolean',
                user: true,
                items: [
                  {
                    name: 'cap_bank_length',
                    type: 'number',
                    label: 'length of foundation',
                    value: '',
                    isRequired: true,
                  },
                  {
                    name: 'cap_bank_width',
                    type: 'number',
                    label: 'width of foundation',
                    value: '',
                    isRequired: true,
                  },
                  {
                    name: 'cap_bank_depth',
                    type: 'number',
                    label: 'depth of foundation',
                    value: '',
                    isRequired: true,
                  },
                ],
                label: 'is Cap bank required?',
                value: '',
                options: ['Yes', 'No'],
                isRequired: true,
              },
            ],
          },
          {
            'SSPD-SSVT': [
              {
                name: 'sspd_ssvt',
                type: 'boolean',
                user: true,
                items: [
                  {
                    name: 'sspd_ssvt_length',
                    type: 'number',
                    label: 'length of foundation',
                    value: '',
                  },
                  {
                    name: 'sspd_ssvt_width',
                    type: 'number',
                    label: 'width of foundation',
                    value: '',
                  },
                  {
                    name: 'sspd_ssvt_depth',
                    type: 'number',
                    label: 'depth of foundation',
                    value: '',
                  },
                ],
                label: 'is a SSPD-SSVT required?',
                value: '',
                options: ['Yes', 'No'],
                isRequired: true,
              },
            ],
          },
          {
            'Control House': [
              {
                name: 'control_house_diameter',
                type: 'number',
                user: true,
                label: 'Diameter of foundation',
                value: '',
                isRequired: true,
              },
              {
                name: 'control_house_depth',
                type: 'number',
                user: true,
                label: 'Depth of fonudation',
                value: '',
                isRequired: true,
              },
            ],
          },
        ],
      },
      systemInput: {},
      ghUrl: '{}',
      createdBy: '1638e1cb-8a91-468d-a88c-ecceb7af2f88',
      updatedBy: '1638e1cb-8a91-468d-a88c-ecceb7af2f88',
      createdAt: '2023-07-31T05:11:49.176Z',
      updatedAt: '2023-07-31T05:11:49.176Z',
    },
  ],
};

export const getGeneratorList = async () => {
  try {
    const res = await getApiCDP('configurator/cdpTypeList');
    return res.result || [];
  } catch {
    return [];
  }
};

export const getCdpInstenceList = async (cdpId: string) => {
  try {
    const res = await getApiCDP(
      `configurator/cdpInstanceList?cdpTypeId=${cdpId}`
    );
    return res?.result || [];
  } catch {
    return [];
  }
};

export const createCDPInstance = async (body: any) => {
  try {
    const res = await postApiCDP('configurator/addCdpInstance', body);
    return res;
  } catch {
    return [];
  }
};

const getAnsList2 = (items: Array<any>) => {
  let answeresList = [] as Array<any>
  items.forEach((item: any) => {
    const ansObject = {
      name: item.name,
      label: item.label,
      value: item.value || item.defaultValue,
      uniqueId: item.uniqueId
    }
    answeresList = [...answeresList, ansObject, ...(Array.isArray(item.items) ? getAnsList2(item.items) : [])]
  })
  return answeresList
}

const converCdpObjectInSingleList = (parameters: Array<any>) => {
  let answeresList = [] as Array<any>
    parameters.forEach((parameter: any) => {
      const inputOptions = Object.keys(parameter) || [];
      inputOptions.forEach((option: string) => {
        answeresList = [...answeresList, ...getAnsList2(parameter[option] || [])]
      })
    })
    return answeresList
}

export const getGeneratorFormData = async (cdpId: string) => {
  const createGroup = (options: Array<any>) => {
     const optionGroup = [] as Array<any>
     options.forEach((option: any) => {
       const index = optionGroup.findIndex((group: any) => {
        // debugger
        return group.name === option.subGroup
       })
       if (index === -1) {
        optionGroup.push({
          name: option.subGroup,
          options: [option]
        })
       } else {
        optionGroup[index].options.push(option)
       }
     })
     return optionGroup
  }

  const getAnsList = (items: Array<any>) => {
    let answeresList = [] as Array<any>
    items.forEach((item: any) => {
      const ansObject = {
        name: item.name,
        label: item.label,
        value: item.defaultValue,
        uniqueId: item.uniqueId
      }
      answeresList = [...answeresList, ansObject, ...(Array.isArray(item.items) ? getAnsList(item.items) : [])]
    })
    return answeresList
  }
  const createAnsweresList = (parameters: Array<any>) => {
    let answeresList = [] as Array<any>
    parameters.forEach((parameter: any) => {
      const inputOptions = Object.keys(parameter) || [];
      inputOptions.forEach((option: string) => {
        answeresList = [...answeresList, ...getAnsList(parameter[option] || [])]
      })
    })
    return answeresList
  }
  try {
    const res = await getApiCDP(
      `configurator/cdpTypeQuestion?cdpTypeId=${cdpId}`
    );
    const userInput = res?.result?.[0].userInput || [];
    const inputObjects: any[] = [];
    userInput.parameters.forEach((parameter: any) => {
      const inputOptions = Object.keys(parameter) || [];
      inputOptions.forEach((option: string) => {
        const optionsObject = {} as any;

        optionsObject.name = option;
        optionsObject.value = createGroup(parameter[option]);
        inputObjects.push(optionsObject);
      });
    });
    const answereList = createAnsweresList(userInput.parameters)
    const cdpDetail = res?.result?.[0]
    delete cdpDetail.userInput
    return [inputObjects, answereList, cdpDetail];
  } catch {
    return [];
  }
};

export const saveGeneratorFormData = async (body: any) => {
  try {
    const res = await postApiCDP('configurator/cdpCompute', body);
    return res;
  } catch {
    return [];
  }
}

export const getCdpInstenceFilledData = async (instanceId: string) => {
  try {
    const res = await getApiCDP(
      `configurator/quesAnswerByInstanceId?instanceId=${instanceId}`
    );
    const parameters = res?.result?.parameters || [];
    return converCdpObjectInSingleList(parameters)
  } catch {
    return [];
  }
}
