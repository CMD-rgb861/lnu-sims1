import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import axiosClient from '../../../api/axiosClient'; 

const EvaluationPage = () => {


    return (
        <Grid>
            <Grid.Col span={12}>
                <Breadcrumbs separator=">" mb="md" fw={400} fz="xs">{items}</Breadcrumbs>
                <Divider mb="lg" />
                
                {/* Page Header */}
                <Title align="left" order={2} mb={4} fw={600} fz={20}>
                    My Evaluation
                </Title>
                <Text fz="xs" fw={500} mb="lg" c="dimmed">
                    View your Evaluation
                </Text>

                
            </Grid.Col>
        </Grid>
    );
};

export default EvaluationPage;