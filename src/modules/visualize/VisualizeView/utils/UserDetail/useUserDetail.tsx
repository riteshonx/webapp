import { gql, QueryHookOptions, useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useLoginQueryOptions } from "../../hooks/useQueryOptions";

export interface UserDetail {
    email: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    companyAssociations: {
        companyId: number,
        company: {
            name: string,
        },
        tenantAssociation: {
            tenantRole: {
                role: string
            }
        }
    }[]
}

const FETCH_USER_DETAIL = gql `
    query FetchUserDetail {
        users: user {
            email
            firstName
            jobTitle
            lastName
            companyAssociations {
                companyId
                company {
                    name
                }
                tenantAssociation {
                    tenantRole {
                        role
                    }
                }
            }
        }
    }
`;

export function useUserDetail() {
    const [userDetail, setUserDetail] = useState<UserDetail>();

    const queryOptions = useLoginQueryOptions('updateMyUser');

    const [getUserDetail] = useLazyQuery<{users: UserDetail[]}>(FETCH_USER_DETAIL);

    useEffect(() => {
        if (Boolean(queryOptions)) {
            buildUserDetail(queryOptions!);
        }
    }, [queryOptions]);

    async function buildUserDetail(queryOptions: QueryHookOptions) {
        const {data} = await getUserDetail(queryOptions);

        if (Boolean(data) && Boolean(data!.users) && Boolean(data!.users[0])) {
            const {users} = data!;

            setUserDetail(users[0]);
        }
    }

    return userDetail;
}