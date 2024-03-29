import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { Grid, Space, Title} from '@mantine/core';
import { PollCreationForm } from '@/components/PollCreationForm/PollCreationForm';
import { DashboardPollsTable } from '@/components/DashboardPollsTable/DashboardPollsTable';
import Head from 'next/head';
import { getCookie } from 'cookies-next';
import requestIp from 'request-ip';


const DashboardPage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {

  return (
    <>
      <Head>
        <title>Survey App - Dashboard</title>
      </Head>
      <Grid my="xl" justify="space-between">

        <Grid.Col span={12}>
          <Title order={2} fw={300} >
            Your Dashboard
          </Title>
          <Space h='xl'/>
        </Grid.Col>

        <Grid.Col xs={12} sm={6}>
          <Title order={3} fw={300} >Your polls:</Title>
          <Space h='xl'/>
          <DashboardPollsTable {...props}></DashboardPollsTable>
        </Grid.Col>
        
        <Grid.Col xs={12} sm={6}>
          <Title order={3} fw={300} >Create new poll</Title>
          <Space h='xl'/>
          <PollCreationForm></PollCreationForm>
        </Grid.Col>

      </Grid>
    </>
  )
};


export const getServerSideProps: GetServerSideProps<PageDataWithIp> = async ({ req, res }) => {
  const reqIp = requestIp.getClientIp(req);
  const userIp = reqIp ? reqIp : getCookie("user-ip", { req, res });

  return {
    props: {
      ip: userIp
    }
  };
};

export default DashboardPage;