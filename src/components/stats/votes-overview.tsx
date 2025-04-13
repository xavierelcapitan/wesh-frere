"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface VotesOverviewProps {
  positiveVotes: number
  negativeVotes: number
}

export function VotesOverview({ positiveVotes, negativeVotes }: VotesOverviewProps) {
  const totalVotes = positiveVotes + negativeVotes
  const positivePercentage = totalVotes > 0 ? Math.round((positiveVotes / totalVotes) * 100) : 0
  const negativePercentage = totalVotes > 0 ? Math.round((negativeVotes / totalVotes) * 100) : 0

  const data = [
    { name: 'Votes positifs', value: positiveVotes, color: '#10b981' },
    { name: 'Votes négatifs', value: negativeVotes, color: '#ef4444' },
  ]

  const COLORS = ['#10b981', '#ef4444']

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vue d'ensemble des votes</CardTitle>
        <CardDescription>Répartition des votes positifs et négatifs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} votes`, '']} 
                labelFormatter={() => ''} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col items-center bg-green-50 p-3 rounded-md">
            <p className="text-sm text-gray-600 mb-1">Votes positifs</p>
            <p className="text-2xl font-bold text-green-600">{positiveVotes}</p>
            <p className="text-sm text-gray-600">{positivePercentage}%</p>
          </div>
          <div className="flex flex-col items-center bg-red-50 p-3 rounded-md">
            <p className="text-sm text-gray-600 mb-1">Votes négatifs</p>
            <p className="text-2xl font-bold text-red-600">{negativeVotes}</p>
            <p className="text-sm text-gray-600">{negativePercentage}%</p>
          </div>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          Nombre total de votes: {totalVotes}
        </div>
      </CardContent>
    </Card>
  )
} 