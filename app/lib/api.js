import axios from 'axios';
// import { cookies } from 'next/headers';

// const urlNode = `${process.env.NEXT_PUBLIC_URL_API}:${process.env.NEXT_PUBLIC_PORT_API}`;
const urlNode = `http://localhost:8080`;

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
 
export const getDateTicket = (async (filter) => {
    const token = getCookie("token");
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json', // Set the Content-Type header to indicate JSON data
            'Authorization': `Bearer ${token}`
        }   
    };

    try{
        // console.log(filter);
        const params = new URLSearchParams();

        if (filter) {
            if (filter.client) {
                params.append('client', filter.client);
            }
        }

        const response = await axios.get(`/api/tickets/date?${params.toString()}`, axiosConfig);
        return response.data || null;
    } catch (error) {
        console.log(error);
    }
})

export const postData = (async (data) => {
    const token = getCookie("token");
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json', // Set the Content-Type header to indicate JSON data
            'Authorization': `Bearer ${token}`
        }   
    };

    try{
        const response = await axios.post(`/api/tickets`, data, axiosConfig);
        if(response.status === 200 && response.data){
            const message = {
                status: response.status,
                message: response.data
            }
            return message;
        } else {
            const message = {
                status: 406,
                message: 'Data not added successfully!'
            }
            return message;
        }
    } catch (error) {
        console.log(error);
    }
});

export const getData = (async (filter) => {
    // const cookieStore = await cookies();
    const token = getCookie("token");
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json', // Set the Content-Type header to indicate JSON data
            'Authorization': `Bearer ${token}`
        }   
    };

    try{
        // console.log(filter);
        const params = new URLSearchParams();

        if (filter) {
            if (filter.client) {
                params.append('client', filter.client);
            }
            if (filter.startDate) {
                params.append('startDate', filter.startDate);
            }
            if (filter.endDate) {
                params.append('endDate', filter.endDate);
            }
            if (filter.resolvedStartDate) {
                params.append('startDateR', filter.resolvedStartDate);
            }
            if (filter.resolvedEndDate) {
                params.append('endDateR', filter.resolvedEndDate);
            }
        }

        const response = await axios.get(`/api/tickets?${params.toString()}`, axiosConfig);
        return response.data || null;
    } catch (error) {
        console.log(error);
    }
})

export const patchData = (async (data) => {
    const token = getCookie("token");
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json', // Set the Content-Type header to indicate JSON data
            'Authorization': `Bearer ${token}`
        }   
    };

    try{
        const response = await axios.patch(`/api/tickets`, data, axiosConfig);
        if(response.status === 200 && response.data){
            const message = {
                status: response.status,
                message: response.data
            }
            return message;
        } else {
            const message = {
                status: 406,
                message: 'Data not updated successfully!'
            }
            return message;
        }
    } catch (error) {
        console.log(error);
    }
});

export const deleteData = (async (data) => {
    const token = getCookie("token");

    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json', // Set the Content-Type header to indicate JSON data
            'Authorization': `Bearer ${token}`
        }, 
        data: data   
    };

    try{
        const response = await axios.delete(`/api/tickets`, axiosConfig);
        if(response.status === 200 && response.data){
            const message = {
                status: response.status,
                message: response.data
            }
            return message;
        } else {
            const message = {
                status: 406,
                message: 'Data not deleted successfully!'
            }
            return message;
        }
    } catch (error) {
        // console.log(error);
    }
})

export const getMasterData = (async (filter) => {
    // const cookieStore = await cookies();
    // const token = cookieStore.get('token')?.value || null;
    const token = getCookie("token");
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json', // Set the Content-Type header to indicate JSON data
            'Authorization': `Bearer ${token}`
        }   
    };

    try{
        const params = new URLSearchParams();

        if (filter && filter.client) {
            params.append('client', filter.client);
        }
        
        const response = await axios.get(`/api/master-data/?${params.toString()}`, axiosConfig);
        if(response.data){
            const data = response.data;
            return data;
        } 
    } catch (error) {
        console.log(error);
    }
})

export const postClient = (async (data) => {
    const token = getCookie("token");
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json', // Set the Content-Type header to indicate JSON data
            'Authorization': `Bearer ${token}`
        }   
    };

    try{
        const response = await axios.post(`/api/master-data/client`, data, axiosConfig);
        if(response.status === 200 && response.data){
            const message = {
                status: response.status,
                message: response.data
            }
            return message;
        } else {
            const message = {
                status: 406,
                message: 'Data not added successfully!'
            }
            return message;
        }
    } catch (error) {
        console.log(error);
    }
})

export const deleteClient = (async (data) => {
    const token = getCookie("token");
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json', // Set the Content-Type header to indicate JSON data
            'Authorization': `Bearer ${token}`
        }, 
        data: data   
    };

    try{
        const response = await axios.delete(`/api/master-data/client`, axiosConfig);
        if(response.status === 200 && response.data){
            const message = {
                status: response.status,
                message: response.data
            }
            return message;
        } else {
            const message = {
                status: 406,
                message: 'Data not deleted successfully!'
            }
            return message;
        }
    } catch (error) {
        console.log(error);
    }
})

export const patchClient = (async (data) => {
    const token = getCookie("token");
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json', // Set the Content-Type header to indicate JSON data
            'Authorization': `Bearer ${token}`
        }   
    };

    try{
        const response = await axios.patch(`/api/master-data/client`, data, axiosConfig);
        if(response.status === 200 && response.data){
            const message = {
                status: response.status,
                message: response.data
            }
            return message;
        } else {
            const message = {
                status: 406,
                message: 'Data not updated successfully!'
            }
            return message;
        }
    } catch (error) {
        console.log(error);
    }
})

export const postAppModule = (async (data) => {
    const token = getCookie("token");
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json', // Set the Content-Type header to indicate JSON data
            'Authorization': `Bearer ${token}`
        }   
    };

    try{
        const response = await axios.post(`/api/master-data/app-module`, data, axiosConfig);
        if(response.status === 200 && response.data){
            const message = {
                status: response.status,
                message: response.data
            }
            return message;
        } else {
            const message = {
                status: 406,
                message: 'Data not added successfully!'
            }
            return message;
        }
    } catch (error) {
        console.log(error);
    }
})

export const patchAppModule = (async (data) => {
    const token = getCookie("token");
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json', // Set the Content-Type header to indicate JSON data
            'Authorization': `Bearer ${token}`
        }   
    };

    try{
        const response = await axios.patch(`/api/master-data/app-module`, data, axiosConfig);
        if(response.status === 200 && response.data){
            const message = {
                status: response.status,
                message: response.data
            }
            return message;
        } else {
            const message = {
                status: 406,
                message: 'Data not updated successfully!'
            }
            return message;
        }
    } catch (error) {
        console.log(error);
    }
})

export const deleteAppModule = (async (data) => {
    const token = getCookie("token");
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json', // Set the Content-Type header to indicate JSON data
            'Authorization': `Bearer ${token}`
        },
        data: data   
    };

    try{
        const response = await axios.delete(`/api/master-data/app-module`, axiosConfig);
        if(response.status === 200 && response.data){
            const message = {
                status: response.status,
                message: response.data
            }
            return message;
        } else {
            const message = {
                status: 406,
                message: 'Data not deleted successfully!'
            }
            return message;
        }
    } catch (error) {
        console.log(error);
    }
})

export const getTicketDeleted = (async (filter) => {
    const token = getCookie("token");
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json', // Set the Content-Type header to indicate JSON data
            'Authorization': `Bearer ${token}`
        }   
    };

    try{
        const params = new URLSearchParams();

        if (filter) {
            if (filter.client) {
                params.append('client', filter.client);
            }
            if (filter.startDate) {
                params.append('startDate', filter.startDate);
            }
            if (filter.endDate) {
                params.append('endDate', filter.endDate);
            }
            if (filter.resolvedStartDate) {
                params.append('startDateR', filter.resolvedStartDate);
            }
            if (filter.resolvedEndDate) {
                params.append('endDateR', filter.resolvedEndDate);
            }
        }

        const response = await axios.get(`/api/ticket-deleted?${params.toString()}`, axiosConfig);
        return response.data || null;
    } catch (error) {
        console.log(error);
    }
})

export const patchTicketDeleted = (async (data) => {
    const token = getCookie("token");
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json', // Set the Content-Type header to indicate JSON data
            'Authorization': `Bearer ${token}`
        }   
    };

    try{
        // console.log(data);
        const response = await axios.patch(`/api/ticket-deleted`, data, axiosConfig);
        if(response.status === 200 && response.data){
            const message = {
                status: response.status,
                message: response.data
            }
            return message;
        } else {
            const message = {
                status: 406,
                message: 'Data not updated successfully!'
            }
            return message;
        }
    } catch (error) {
        console.log(error);
    }
})

export const getUser = (async () => {
    const token = getCookie("token");
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json', // Set the Content-Type header to indicate JSON data
            'Authorization': `Bearer ${token}`
        }   
    };

    try{
        
        const response = await axios.get(`/api/master-data/users`, axiosConfig);
        if(response.data){
            const data = response.data;
            return data;
        } 
    } catch (error) {
        console.log(error);
    }
})

export const postUser = (async (data) => {
    const token = getCookie("token");
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json', // Set the Content-Type header to indicate JSON data
            'Authorization': `Bearer ${token}`
        }   
    };

    try{
        const response = await axios.post(`/api/master-data/users`, data, axiosConfig);
        if(response.status === 200 && response.data){
            const message = {
                status: response.status,
                message: response.data
            }
            return message;
        } else {
            const message = {
                status: 406,
                message: 'Data User not added successfully!'
            }
            return message;
        }
    } catch (error) {
        console.log(error);
    }
})

export const patchUser = (async (data) => {
    const token = getCookie("token");
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json', // Set the Content-Type header to indicate JSON data
            'Authorization': `Bearer ${token}`
        }   
    };

    try{
        const response = await axios.patch(`/api/master-data/users`, data, axiosConfig);
        if(response.status === 200 && response.data){
            const message = {
                status: response.status,
                message: response.data
            }
            return message;
        } else {
            const message = {
                status: 406,
                message: 'Data User not updated successfully!'
            }
            return message;
        }
    } catch (error) {
        // console.log(error);
        const message = {
            status: 401,
            message: 'Data not updated successfully!'
        }
        if(error && error.data) {
            if(error.data.message === 'Invalid credentials') {
                message.message = 'Password not match!'
            }
        }
        return message;
    }
})