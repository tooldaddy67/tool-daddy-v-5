'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Globe, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const STATUS_CODES = [
    { code: 100, title: 'Continue', desc: 'The server has received the request headers and the client should proceed to send the request body.', type: 'Info' },
    { code: 101, title: 'Switching Protocols', desc: 'The requester has asked the server to switch protocols.', type: 'Info' },
    { code: 200, title: 'OK', desc: 'The request has succeeded.', type: 'Success' },
    { code: 201, title: 'Created', desc: 'The request has succeeded and a new resource has been created.', type: 'Success' },
    { code: 202, title: 'Accepted', desc: 'The request has been received but not yet acted upon.', type: 'Success' },
    { code: 204, title: 'No Content', desc: 'The request has succeeded but returns no message body.', type: 'Success' },
    { code: 301, title: 'Moved Permanently', desc: 'The resource has been permanently moved to a new URI.', type: 'Redirect' },
    { code: 302, title: 'Found', desc: 'The resource has been temporarily moved to a new URI.', type: 'Redirect' },
    { code: 304, title: 'Not Modified', desc: 'Indicates that the resource has not been modified since the version specified.', type: 'Redirect' },
    { code: 400, title: 'Bad Request', desc: 'The server could not understand the request due to invalid syntax.', type: 'Client Error' },
    { code: 401, title: 'Unauthorized', desc: 'The client must authenticate itself to get the requested response.', type: 'Client Error' },
    { code: 403, title: 'Forbidden', desc: 'The client does not have access rights to the content.', type: 'Client Error' },
    { code: 404, title: 'Not Found', desc: 'The server can not find the requested resource.', type: 'Client Error' },
    { code: 405, title: 'Method Not Allowed', desc: 'The request method is known by the server but is not supported by the target resource.', type: 'Client Error' },
    { code: 429, title: 'Too Many Requests', desc: 'The user has sent too many requests in a given amount of time.', type: 'Client Error' },
    { code: 500, title: 'Internal Server Error', desc: 'The server has encountered a situation it doesn\'t know how to handle.', type: 'Server Error' },
    { code: 502, title: 'Bad Gateway', desc: 'The server received an invalid response from the upstream server.', type: 'Server Error' },
    { code: 503, title: 'Service Unavailable', desc: 'The server is not ready to handle the request.', type: 'Server Error' },
    { code: 504, title: 'Gateway Timeout', desc: 'The server is acting as a gateway and cannot get a response in time.', type: 'Server Error' },
];

export default function HttpStatusCodesClient() {
    const [search, setSearch] = useState('');

    const filtered = STATUS_CODES.filter(s =>
        s.code.toString().includes(search) ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.desc.toLowerCase().includes(search.toLowerCase())
    );

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'Success': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Redirect': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'Client Error': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'Server Error': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                    <Globe className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline mb-2">HTTP Status Codes</h1>
                <p className="text-muted-foreground">Comprehensive reference for HTTP response status codes.</p>
            </div>

            <Card className="glass-panel border-primary/20 mb-8">
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search by code (e.g. 404) or meaning..."
                            className="pl-10 h-12 text-lg"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((status) => (
                    <Card key={status.code} className="glass-panel border-primary/10 hover:border-primary/30 transition-all hover:bg-primary/5 group">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <span className={`text-2xl font-black font-mono tracking-tighter ${status.type === 'Success' ? 'text-green-500' :
                                        status.type === 'Client Error' ? 'text-orange-500' :
                                            status.type === 'Server Error' ? 'text-red-500' :
                                                'text-blue-500'
                                    }`}>
                                    {status.code}
                                </span>
                                <Badge variant="outline" className={getTypeColor(status.type)}>
                                    {status.type}
                                </Badge>
                            </div>
                            <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                                {status.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {status.desc}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
